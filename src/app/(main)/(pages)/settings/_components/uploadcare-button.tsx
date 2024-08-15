'use client'

import React, { useEffect, useState } from 'react';
import { FileUploaderRegular } from '@uploadcare/react-uploader';
import '@uploadcare/react-uploader/core.css';
import { useRouter } from 'next/navigation';
import Image from "next/image"; // Import useRouter from Next.js

type Props = {
    onUpload: (e: string) => any
}
type FileItem = {
    cdnUrl: string;
    uuid: string;
    // ... add other relevant properties
};


const UploadCareButton = ({ onUpload }: Props) => {
    const [files, setFiles] = useState<FileItem[]>([]);
    const router = useRouter(); // Use Next.js router for navigation actions

    // Handler to process the file upload and execute the onUpload callback
    const handleChangeEvent = (event: any) => {
        const successfulFiles = event.successEntries.filter((file : any )=> file.status === 'success')
            .map((file : any) => ({ cdnUrl: file.cdnUrl, uuid: file.uuid }));
        setFiles(successfulFiles);

        successfulFiles.forEach(async (file: any) => {
            const result = await onUpload(file.cdnUrl);
            if (result) {
                router.refresh(); // Refresh the page if the onUpload callback returns a truthy value
            }
        });
    };

    return (
        <div>
            <FileUploaderRegular
                onChange={handleChangeEvent}
                pubkey="450d188afc66aa9017b8"
            />

            {/*<div>*/}
            {/*    {files.map(file => (*/}
            {/*        <div key={file.uuid}>*/}
            {/*            <Image*/}
            {/*                src={file.cdnUrl}*/}
            {/*                alt={file.fileInfo.originalFilename}*/}
            {/*                fill*/}
            {/*                className="rounded-md"*/}
            {/*            />*/}
            {/*        </div>*/}
            {/*    ))}*/}
            {/*</div>*/}
        </div>
    );
}

export default UploadCareButton;
