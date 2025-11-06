'use client';
import React, { useState } from 'react'
import AddVideoButton from '@/components/AddVideoButton'
import { DropzoneEmptyState, Dropzone, DropzoneContent } from "./../../components/ui/shadcn-io/dropzone"

interface VideoUploadRequest {
    userId: string;
    title: string;
    shortDescription: string;
    uploadUrl: string;
    longDescription?: string;
    tags?: string[];
    thumbnail?: string;
}


const VideoUpload = () => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [fileUrl, setFileUrl] = useState<string>("");

    

    const handleDrop = (acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) setFile(acceptedFiles[0]);
    };
    return (
        <div>
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
            <AddVideoButton file={file} fileUrl={fileUrl} setFileUrl={setFileUrl} uploading={uploading} setUploading={setUploading} />
        </div>

    )
}

export default VideoUpload