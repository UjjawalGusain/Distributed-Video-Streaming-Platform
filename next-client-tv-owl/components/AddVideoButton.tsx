'use client';

import React, { useState } from "react";
import axios from "axios";
import { Button } from "./ui/button";
import APIS from "@/apis/apis";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

const CHUNK_SIZE = 5 * 1024 * 1024; // 5 MB per part

type AddVideoProps = {
  file: File | null;
  fileUrl: string | null;
  setFileUrl: React.Dispatch<React.SetStateAction<string>>;
  uploading: boolean;
  setUploading: React.Dispatch<React.SetStateAction<boolean>>;
  setVideoDuration: React.Dispatch<React.SetStateAction<number>>;
};

const AddVideoButton = ({ file, fileUrl, setFileUrl, uploading, setUploading, setVideoDuration }: AddVideoProps) => {

  const { data: session } = useSession();

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
    setVideoDuration(duration);
    console.log("Duration (s):", duration);

    const fileName = file.name;
    const fileType = file.type;
    let uploadId = "";
    const parts: { ETag: string; PartNumber: number }[] = [];

    try {

      const jwt = session?.user?.jwt;

      if (!jwt) {
        toast.error("Missing authentication token");
        return;
      }
      // Step 1: Start multipart upload
      const startUploadResponse = await axios.post(
        APIS.START_UPLOAD,
        { fileName, fileType },
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );

      console.log("startUploadResponse.data.data: ", startUploadResponse.data.data);

      uploadId = startUploadResponse.data.data.uploadId;
      const updatedFilename = startUploadResponse.data.data.fileName;
      console.log("updatedFilename: ", updatedFilename);

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
                APIS.PART_UPLOAD,
                {
                  fileName: updatedFilename,
                  partNumber,
                  uploadId,
                  fileChunk: base64Chunk,
                },
                {
                  headers: {
                    Authorization: `Bearer ${jwt}`,
                  },
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
      const completeUploadResponse = await axios.post(APIS.COMPLETE_UPLOAD, {
        fileName: updatedFilename,
        uploadId,
        parts,
      }, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });

      setFileUrl(completeUploadResponse.data.data.fileUrl);
      toast("Video uploaded successfully!");
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
