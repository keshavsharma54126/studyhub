
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import amqp from 'amqplib';
import dotenv from "dotenv";
import path from "path";
import fs, { createWriteStream } from "fs-extra";
import pdfParse from "pdf-parse";
import pdfPoppler from "pdf-poppler";


dotenv.config();

const s3 = new S3Client({
    region:process.env.AWS_REGION as string,
    credentials:{
        accessKeyId:process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY as string
    }
})

const convertPdfToImage = async(inputPath:string,outputPath:string)=>{
    const poppler = new pdfPoppler()
}

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost:5672"
const QUEUE_NAME = "upload-pdf"

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
                const { pdfUrl,sessionId } = JSON.parse(msg.content.toString());
                console.log(`Processing pdf ${pdfUrl} for session ${sessionId}`);
                
                const url = new URL(pdfUrl);
                const bucketName = url.hostname.split(".")[0];
                const key = url.pathname.slice(1);
        
                const inputDir= path.join(__dirname,"../input")
                const outputDir= path.join(__dirname,"../output")
                await fs.ensureDir(inputDir)
                await fs.ensureDir(outputDir)
        
                const inputPath= path.join(inputDir,sessionId)
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

                
            
                
            } catch (error) {
                console.error('Error processing video:', error);
                channel.nack(msg, false, true);
            }
        });
    } catch (error) {
        console.error("Failed to connect to RabbitMQ", error);
        setTimeout(() => startConsumer(), 5000);
    }
}

startConsumer();

