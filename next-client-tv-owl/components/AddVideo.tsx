'use client';

import React, { useState } from "react";
import { DropzoneEmptyState, Dropzone, DropzoneContent } from './ui/shadcn-io/dropzone';
import axios from "axios";
import { Button } from "./ui/button";

const CHUNK_SIZE = 5 * 1024 * 1024; // 5 MB per part

const AddVideo = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState<string>("");

  const handleDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) setFile(acceptedFiles[0]);
  };

  const handleFileUpload = async () => {
    if (!file) return console.error("No file selected");
    setUploading(true);

    const fileName = file.name;
    const fileType = file.type;
    let uploadId = "";
    const parts: { ETag: string; PartNumber: number }[] = [];

    try {
      // Step 1: Start multipart upload
      const startUploadResponse = await axios.post("http://localhost:5000/api/video/start-upload", {
        fileName,
        fileType,
      });

      uploadId = startUploadResponse.data.data.uploadId;

      // Step 2: Split file and upload parts
      const totalParts = Math.ceil(file.size / CHUNK_SIZE);

      for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
        const start = (partNumber - 1) * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const fileChunk = file.slice(start, end);

        const reader = new FileReader();

        const uploadPart = (): Promise<void> => {
          return new Promise((resolve, reject) => {
            reader.onload = async () => {
              if (!reader.result || !(reader.result instanceof ArrayBuffer))
                return reject("Invalid reader result");

              const base64Chunk = btoa(
                new Uint8Array(reader.result).reduce(
                  (data, byte) => data + String.fromCharCode(byte),
                  ""
                )
              );

              const uploadPartResponse = await axios.post(
                "http://localhost:5000/api/video/part-upload",
                {
                  fileName,
                  partNumber,
                  uploadId,
                  fileChunk: base64Chunk,
                }
              );

              parts.push({
                ETag: uploadPartResponse.data.data.eTag,
                PartNumber: partNumber,
              });
              resolve();
            };

            reader.onerror = reject;
            reader.readAsArrayBuffer(fileChunk);
          });
        };

        await uploadPart();
      }

      // Step 3: Complete multipart upload
      const completeUploadResponse = await axios.post("http://localhost:5000/api/video/complete-upload", {
        fileName,
        uploadId,
        parts,
      });

      setFileUrl(completeUploadResponse.data.fileUrl);
      alert("Video uploaded successfully!");
    } catch (err) {
      console.error("Video upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Dropzone
        accept={{ 'video/*': [] }}
        maxFiles={1}
        maxSize={1024 * 1024 * 1024} // 1 GB
        minSize={1024 * 100} // 100 KB
        onDrop={handleDrop}
        onError={console.error}
        src={file ? [file] : []}
        className="w-full max-w-xl border border-dashed border-gray-500 p-4 rounded-lg"
      >
        <DropzoneEmptyState />
        <DropzoneContent />
      </Dropzone>

      <Button
        onClick={handleFileUpload}
        disabled={!file || uploading}
        className="mt-4"
      >
        {uploading ? "Uploading..." : "Upload Video"}
      </Button>

      {fileUrl && (
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline mt-4"
        >
          View Uploaded Video
        </a>
      )}
    </div>
  );
};

export default AddVideo;
