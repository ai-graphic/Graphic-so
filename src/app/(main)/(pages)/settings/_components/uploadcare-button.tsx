'use client'

import React, { useEffect, useState } from 'react';
import { FileUploaderRegular } from '@uploadcare/react-uploader';
import '@uploadcare/react-uploader/core.css';
import { useRouter } from 'next/navigation';
import Image from "next/image"; // Import useRouter from Next.js

type Props = {
    onUpload: (e: string) => any
}

const UploadCareButton = ({ onUpload }: Props) => {
    const [files, setFiles] = useState([]);
    const router = useRouter(); // Use Next.js router for navigation actions

    // Handler to process the file upload and execute the onUpload callback
    const handleChangeEvent = (items: any) => {
        const successfulFiles: any = items.allEntries.filter(file => file.status === 'success');
        setFiles([...successfulFiles]);

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
