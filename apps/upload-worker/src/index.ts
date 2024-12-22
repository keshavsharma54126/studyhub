import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import amqp from 'amqplib';
import dotenv from "dotenv";
import path from "path";
import fs, { createReadStream, createWriteStream } from "fs-extra";
import { fromPath } from 'pdf2pic';
import client from "@repo/db/client";


dotenv.config();
if(!process.env.REGION || !process.env.ACCESS_KEY_ID || !process.env.SECRET_ACCESS_KEY){
    throw new Error("Missing environment variables")
}
const s3 = new S3Client({
    region:process.env.REGION as string,
    credentials:{
        accessKeyId:process.env.ACCESS_KEY_ID as string,
        secretAccessKey:process.env.SECRET_ACCESS_KEY as string
    }
})



const convertPdfToImages = async(inputPath: string, outputDir: string, sessionId: string) => {
    try {
        const options = {
            density: 100,
            saveFilename: `${sessionId}_page`,
            savePath: outputDir,
            format: "png",
            width: 2480,
            height: 3508
        };
        
        const convert = fromPath(inputPath, options);
        
        // Convert all pages
        const result = await convert.bulk(-1);
        console.log("PDF to images converted", result);
        return result;
    } catch(e) {
        if(e instanceof Error) {
            console.error("Error while converting PDF to images:", e);
            throw e;
        }
    }
}

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost:5672"
const QUEUE_NAME = "upload-pdf"

const generatePresignedUrl = async (bucketName: string, key: string) => {
    const command = new GetObjectCommand({ Bucket: bucketName, Key: key });
    const url = await getSignedUrl(s3, command, { expiresIn: 60 * 60 * 100 }); // 10 years
    return url;
};



const cleanup = async (inputPath: string, outputDir: string) => {
    try {
        await fs.remove(inputPath);
        await fs.emptyDir(outputDir);
    } catch (error) {
        console.error('Cleanup failed:', error);
    }
};

const purgeQueue = async()=>{
    try{
        const connection = await amqp.connect(RABBITMQ_URL)
        const channel = await connection.createChannel()
        await channel.assertQueue(QUEUE_NAME, {
            durable: true
        })
        await channel.purgeQueue(QUEUE_NAME)
        await channel.close()
        await connection.close()
    }catch(e){
        console.error("failed to purge queue: ",e)
    }
}

async function startConsumer() {
    try {
        const connection = await amqp.connect(RABBITMQ_URL)
        const channel = await connection.createChannel()
        await channel.assertQueue(QUEUE_NAME, {
            durable: true
        })

        channel.prefetch(1)
        console.log("Connected to RabbitMQ, waiting for messages...")

        channel.consume(QUEUE_NAME, async (msg) => {
            if (!msg) return;
            
            
            try {
                const { pdfUrls, sessionId } = JSON.parse(msg.content.toString());
                console.log(`Processing pdf ${pdfUrls} for session ${sessionId}`);
                const inputDir= path.join(__dirname,"../input")
                const outputDir= path.join(__dirname,"../output")
                await fs.ensureDir(inputDir)
                await fs.ensureDir(outputDir)
                
            const inputPath = path.join(inputDir, sessionId);
                
                for(const pdfUrl of pdfUrls){
                    const url = new URL(pdfUrl);
                    const bucketName = url.hostname.split(".")[0];
                    const key = url.pathname.slice(1);
            
                    const writeStream = createWriteStream(inputPath)
                    const getObjectCommand = new GetObjectCommand({
                        Bucket:bucketName,
                        Key:key
                    })
            
                    const response = await s3.send(getObjectCommand);
                    const body = response.Body;
                    if(!body){
                        throw new Error("no body found in response from s3")
                    }
                    if (body) {
                        await new Promise((resolve, reject) => {
                            const stream = body as unknown as any;
                            stream.pipe(writeStream);
                            writeStream.on('finish', resolve);
                            writeStream.on('error', reject);
                        });
                    }
    
                    await convertPdfToImages(inputPath, outputDir, sessionId);
                    channel.ack(msg);
    
                    const files =  await fs.readdir(outputDir)
                    for(const file of files){
                        const filePath = path.join(outputDir,file);
                        const fileStream = createReadStream(filePath);
    
                        const putObjectCommand = new PutObjectCommand({
                            Bucket:bucketName,
                            Key:`studyhub/slides/${sessionId}/${file}`,
                            Body:fileStream,
                            ContentType:"image/png"
                        })
                        await s3.send(putObjectCommand)
    
                        // Generate presigned URL
                        const presignedUrl = await generatePresignedUrl(bucketName, `studyhub/slides/${sessionId}/${file}`);
                        console.log(`Presigned URL for ${file}: ${presignedUrl}`);
                        await client.slide.create({
                            data:{
                                sessionId,
                                url:presignedUrl
                            }
                        })
                    }
    
                }
                
                await cleanup(inputPath, outputDir);
            } catch (error) {
                console.error('Error processing PDF:', error);
                channel.nack(msg, false, true);
            }
        });
    } catch (error) {
        console.error("Failed to connect to RabbitMQ", error);
        purgeQueue()
        setTimeout(() => {
           
            startConsumer()
        }, 5000);
    }
}


startConsumer();


