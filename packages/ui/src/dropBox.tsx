"use client";

import React, { useState, useCallback } from "react";
import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { useDropzone } from "react-dropzone";
import { Upload, FileIcon, X, Loader, CheckCircle, AlertCircle } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';



export function Dropbox({accessKeyId, secretAccessKey, region, bucketName, setPdfUrls, setHasSubmitted}: {accessKeyId: string, secretAccessKey: string, region: string, bucketName: string, setPdfUrls: (urls: string[]) => void, setHasSubmitted: (hasSubmitted: boolean) => void}  ) {

  const s3Client = new S3Client({
    region: region,
    credentials: {
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey
    },
  });
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const[hasUploaded, setHasUploaded] = useState(false);
  const [error, setError] = useState<string | null>(null);


  // console.log("this is the project id" ,projectId)
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
    setHasUploaded(true);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const removeFile = (file: File) => {
    setFiles(files.filter((f) => f !== file));
    setHasUploaded(false);
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

      setTimeout(async () => {
        try {
          const deleteObjectCommand = new DeleteObjectCommand({
            Bucket: bucketName,
            Key: "studyhub/" + uploadedFileId,
          });
          await s3Client.send(deleteObjectCommand);
          console.log("File deleted successfully:", uploadedFileId);
        } catch (error) {
          console.error("Error deleting file:", error);
        }
      }, 10000);

    }catch(error){
      setError("Failed to upload file. Please try again.");
      console.log(error);
    }
  };

  const handleSubmit = async () => {
    if(files.length === 0){
      return;
    }
    setIsLoading(true);
    files.map((file: File) => {
      if(file.type === "application/pdf"){
        handleUploading(file);
      }
    });
    setFiles([]);
    setIsLoading(false);
    setSubmitted(true);
    setHasSubmitted(true);
    setHasUploaded(false);
    setTimeout(() => {
      setSubmitted(false);
    }, 10000);
  };

  return (
    <div className="w-full bg-teal-500/10 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-800 p-6">
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
        <p className="text-sm text-gray-400 mt-2">Supported formats: PDF</p>
      </div>

      {files.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-primary-400 mb-3 flex items-center gap-2">
            <FileIcon className="h-5 w-5" />
            Selected Files ({files.length})
          </h3>
          <ul className="space-y-2">
            {files.map((file, index) => (
              <li
                key={index}
                className="flex items-center justify-between bg-slate-700/50 rounded-lg p-3 border border-gray-600 hover:bg-slate-700 transition-all"
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
        </div>
      )}

      <div className="mt-6 flex flex-col items-center gap-4">
        {isLoading && (
          <div className="flex items-center gap-2 text-primary-400">
            <Loader className="w-5 h-5 animate-spin" />
            <span>Uploading files...</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-red-400 bg-red-400/10 p-3 rounded-lg">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        {submitted && (
          <div className="flex items-center gap-2 text-teal-400 bg-neon-400/10 p-3 rounded-lg">
            <CheckCircle className="h-5 w-5" />
            <span>Files submitted successfully!</span>
          </div>
        )}

        {hasUploaded && (
          <button
            className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-lg transition-colors duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSubmit}
            disabled={isLoading || files.length === 0}
          >
            {isLoading ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            {isLoading ? "Uploading..." : "Submit Files"}
          </button>
        )}
      </div>
    </div>
  );
}



