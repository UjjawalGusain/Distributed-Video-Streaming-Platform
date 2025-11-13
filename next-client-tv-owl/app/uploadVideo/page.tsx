'use client';
import React, { useState } from 'react'
import AddVideoButton from '@/components/AddVideoButton'
import { DropzoneEmptyState, Dropzone, DropzoneContent } from "./../../components/ui/shadcn-io/dropzone"
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSeparator,
    FieldSet,
    FieldTitle,
} from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import axios from 'axios';
import APIS from '@/apis/apis';
import { useSession } from 'next-auth/react';
import { title } from 'process';

export function InputDemo() {
    return <Input type="email" placeholder="Email" />
}

const formSchema = z.object({
    title: z
        .string()
        .min(5, "Title must be at least 5 characters.")
        .max(100, "Title must be at most 100 characters."),

    shortDescription: z
        .string()
        .min(10, "Short description must be at least 10 characters.")
        .max(200, "Short description must be at most 200 characters."),

    longDescription: z
        .string()
        .min(50, "Long description must be at least 50 characters.")
        .max(500, "Long description must be at most 500 characters.")
        .optional()
        .or(z.literal("")), // allow empty string

    tags: z
        .string()
        .regex(/^(\s*\w+\s*)(,\s*\w+\s*)*$/, "Tags must be comma-separated words")
        .optional()
        .or(z.literal("")), // allow empty string
});



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
    const [thumbnail, setThumbnail] = useState<File | null>(null);
    const [videoDuration, setVideoDuration] = useState(0);
    const { data: session, status } = useSession();

    const handleDrop = (acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) setFile(acceptedFiles[0]);
    };

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            shortDescription: "",
            longDescription: "",
            tags: "",
        },
    })

    async function onSubmit(data: z.infer<typeof formSchema>) {
        const userId = session?.user?.id;

        if (!fileUrl) return; // make sure video is uploaded

        const formData = new FormData();
        formData.append("userId", userId || "");
        formData.append("title", data.title);
        formData.append("shortDescription", data.shortDescription);
        formData.append("longDescription", data.longDescription || "");
        formData.append("originalVideoUrl", fileUrl);
        formData.append("duration", videoDuration.toString());

        if (thumbnail) {
            formData.append("thumbnail", thumbnail); // send the file
        }

        await axios.post(APIS.SUBMIT_VIDEO, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        toast("Video uploaded successfully!");
    }


    return (
        <div className='flex flex-col items-center w-full my-5'>
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
            <AddVideoButton file={file} fileUrl={fileUrl} setFileUrl={setFileUrl} uploading={uploading} setUploading={setUploading} setVideoDuration={setVideoDuration} />
            {!fileUrl && (
                <div className="mt-6 w-full max-w-xl p-6 border rounded text-center">
                    Please upload a video first to proceed with filling out the details.
                </div>
            )}
            {fileUrl &&

                (<form id="form" onSubmit={form.handleSubmit(onSubmit)}>


                    <FieldSet className="w-2xl">
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="title">
                                    Title <span className="text-red-500">*</span>
                                </FieldLabel>
                                <Controller
                                    name="title"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <>
                                            <Input
                                                {...field}
                                                id="title"
                                                autoComplete="off"
                                                placeholder="Title of your video"
                                            />
                                            {fieldState.error && (
                                                <p className="text-red-500 text-sm mt-1">{fieldState.error.message}</p>
                                            )}
                                        </>
                                    )}
                                />
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="thumbnail">Thumbnail</FieldLabel>
                                <div className="grid w-full max-w-sm items-center gap-3">
                                    <Input
                                        id="thumbnail"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                setThumbnail(e.target.files[0]);
                                            }
                                        }}
                                    />
                                </div>
                                {thumbnail && (
                                    <div className="mt-2">
                                        <Image
                                            src={URL.createObjectURL(thumbnail)}
                                            alt="Preview"
                                            width={100}
                                            height={100}
                                            className="object-cover"
                                        />
                                    </div>
                                )}
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="shortDescription">
                                    Short Description <span className="text-red-500">*</span>
                                </FieldLabel>
                                <Controller
                                    name="shortDescription"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <>
                                            <Textarea
                                                {...field}
                                                id="shortDescription"
                                                rows={7}
                                                placeholder="Add a short description for your video"
                                            />
                                            {fieldState.error && (
                                                <p className="text-red-500 text-sm mt-1">{fieldState.error.message}</p>
                                            )}
                                        </>
                                    )}
                                />
                                <FieldDescription>
                                    Add a compelling short description for your video
                                </FieldDescription>
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="longDescription">Long Description</FieldLabel>
                                <Controller
                                    name="longDescription"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <>
                                            <Textarea
                                                {...field}
                                                id="longDescription"
                                                rows={50}
                                                placeholder="Add a long description for detailed info on your video"
                                            />
                                            {fieldState.error && (
                                                <p className="text-red-500 text-sm mt-1">{fieldState.error.message}</p>
                                            )}
                                        </>
                                    )}
                                />
                                <FieldDescription>
                                    Add a compelling long description for your video
                                </FieldDescription>
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="tags">Tags</FieldLabel>
                                <Controller
                                    name="tags"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <>
                                            <Textarea
                                                {...field}
                                                id="tags"
                                                rows={7}
                                                placeholder="Add video tags (comma separated)."
                                            />
                                            {fieldState.error && (
                                                <p className="text-red-500 text-sm mt-1">{fieldState.error.message}</p>
                                            )}
                                        </>
                                    )}
                                />
                                <FieldDescription>
                                    Tags help recommendation system to reach your target audience
                                </FieldDescription>
                            </Field>
                        </FieldGroup>
                    </FieldSet>
                    <Button type="submit" form="form" className='m-5'>
                        Submit
                    </Button>
                </form>
                )}

        </div>
    )
}

export default VideoUpload