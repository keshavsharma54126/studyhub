"use client";

import React, { useState, useCallback } from "react";
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { useDropzone } from "react-dropzone";
import { Upload, FileIcon, X, Loader } from "lucide-react";
import { useToast } from "./toaster/use-toast.js";
import { v4 as uuidv4 } from 'uuid';



export function Dropbox({accessKeyId, secretAccessKey, region, bucketName, setPdfUrls}: {accessKeyId: string, secretAccessKey: string, region: string, bucketName: string, setPdfUrls: (urls: string[]) => void}  ) {

  const s3Client = new S3Client({
    region: region,
    credentials: {
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey
    },
  });
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);


  // console.log("this is the project id" ,projectId)
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const removeFile = (file: File) => {
    setFiles(files.filter((f) => f !== file));
  };

  const handleUploading = async (currentFile: File) => {
    try{
      const uploadedFileId = uuidv4();
      const putObjectCommand = new PutObjectCommand({
        Bucket: bucketName ,
        Key: "studyhub/" + uploadedFileId,
        Body: currentFile,
      });
      await s3Client.send(putObjectCommand);
      console.log("this is the uploaded file id" ,uploadedFileId)

      const getObjectCommand = new GetObjectCommand({
        Bucket: bucketName ,
        Key: "studyhub/" + uploadedFileId,
      });
      const url = await getSignedUrl(s3Client, getObjectCommand, {
        expiresIn: 100000,
      });
      //@ts-ignore
      setPdfUrls((prev: string[]) => [...prev, url]);

    }catch(error){
      console.log(error)
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    files.map((file: File) => {
      if(file.type === "application/pdf"){
        handleUploading(file);
      }
    });
    setFiles([]);
    setIsLoading(false);
  };

  const { toast } = useToast();

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors duration-300 ${
          isDragActive
            ? "border-primary-400 bg-primary-400/10"
            : "border-gray-600 hover:border-primary-400"
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-300">
          {isDragActive
            ? "Drop the files here"
            : "Drag & drop files here, or click to select files"}
        </p>
        <p className="text-sm text-gray-400 mt-2">Supported formats: CSV</p>
      </div>

      {files.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-primary-400 mb-3">
            Selected Files:
          </h3>
          <ul className="space-y-2">
            {files.map((file, index) => (
              <li
                key={index}
                className="flex items-center justify-between bg-slate-700 rounded-lg p-3 border border-gray-600"
              >
                <div className="flex items-center">
                  <FileIcon className="h-5 w-5 text-primary-400 mr-2" />
                  <span className="text-gray-300 truncate">{file.name}</span>
                </div>
                <button
                  onClick={() => removeFile(file)}
                  className="text-gray-400 hover:text-red-400 transition-colors duration-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </li>
            ))}
          </ul>
          {isLoading && <Loader className="w-5 h-5 text-primary-400" />}
        </div>
      )}
      <button
        onClick={() => {
          handleSubmit();
          toast({
            title: "Uploaded Successfully",
            description: "Your files have been uploaded successfully",
          });
        }}
        className={`rounded-lg px-4 py-2 text-lg bg-blue-600 hover:bg-blue-700 mt-6 ${
          files.length > 0 ? "" : "hidden"
        } `}
      >
        Submit
      </button>
    </div>
  );
}



