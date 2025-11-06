'use client';

import React, { useState } from "react";
import { DropzoneEmptyState, Dropzone, DropzoneContent } from './ui/shadcn-io/dropzone';
import axios from "axios";
import { Button } from "./ui/button";

const CHUNK_SIZE = 5 * 1024 * 1024; // 5 MB per part

type AddVideoProps = {
  file: File | null;
  fileUrl: string | null;
  setFileUrl: React.Dispatch<React.SetStateAction<string>>;
  uploading: boolean;
  setUploading: React.Dispatch<React.SetStateAction<boolean>>;
};

const AddVideoButton = ({ file, fileUrl, setFileUrl, uploading, setUploading }: AddVideoProps) => {

  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.preload = "metadata";

      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        const duration = video.duration;
        resolve(duration);
      };

      video.onerror = () => reject("Error loading video metadata");

      video.src = URL.createObjectURL(file);
    });
  };


  const handleFileUpload = async () => {
    if (!file) return console.error("No file selected");
    setUploading(true);

    const duration = await getVideoDuration(file);
    console.log("Duration (s):", duration);

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

      setFileUrl(completeUploadResponse.data.data.fileUrl);
      alert("Video uploaded successfully!");
    } catch (err) {
      console.error("Video upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">


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
          className="text-white underline mt-4"
        >
          View Uploaded Video
        </a>
      )}
    </div>
  );
};

export default AddVideoButton;
