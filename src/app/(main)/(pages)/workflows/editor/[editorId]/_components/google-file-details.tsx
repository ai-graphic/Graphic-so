import {Card, CardContent, CardDescription} from '@/components/ui/card'
import {onAddTemplate} from '@/lib/editor-utils'
import {ConnectionProviderProps} from "@/providers/connections-providers";
import React from 'react'

type Props = {
    nodeConnection: ConnectionProviderProps
    title: string
    gFile: any[]
}
const isGoogleFileNotEmpty = (file: any): boolean => {
    return Object.keys(file).length > 0 && file.kind !== ''
}

const GoogleFileDetails = ({gFile, nodeConnection, title}: Props) => {
    // if (!isGoogleFileNotEmpty(gFile)) {
    //     return null
    // }

    // const details = ['kind', 'name', 'mimeType']
    // if (title === 'Google Drive') {
    //     details.push('id')
    // }

    return (
        // <div className="flex flex-wrap gap-2">
        //     <Card>
        //         <CardContent className="flex flex-wrap gap-2 p-4">
        //             {details.map((detail) => (
        //                 <div
        //                     key={detail}
        //                     onClick={() =>
        //                         onAddTemplate(nodeConnection, title, gFile[detail])
        //                     }
        //                     className="flex cursor-pointer gap-2 rounded-full bg-white px-3 py-1 text-gray-500"
        //                 >
        //                     {detail}:{' '}
        //                     <CardDescription className="text-black">
        //                         {gFile[detail]}
        //                     </CardDescription>
        //                 </div>
        //             ))}
        //         </CardContent>
        //     </Card>
        // </div>
        <div className="flex flex-wrap gap-2">
            {gFile.map((file, index) => (
                isGoogleFileNotEmpty(file) && (
                    <Card key={index}>
                        <div className="font-bold text-lg mb-2 p-4">File {index + 1}</div>
                        <CardContent className="flex flex-wrap gap-2 p-4">
                            {['kind', 'name', 'mimeType', title === 'Google Drive' ? 'id' : undefined]
                                .filter(detail => detail) // This ensures only valid details are processed
                                .map((detail) => (
                                    <div
                                        key={detail}
                                        onClick={() => onAddTemplate(nodeConnection, title, file[detail])}
                                        className="flex cursor-pointer gap-2 rounded-full bg-white px-3 py-1 text-gray-500 border"
                                    >
                                        <span className="flex bg-black text-white rounded-xl py-1 px-2 items-center justify-between">{detail}:</span>
                                        <CardDescription className="text-black flex items-center justify-between">
                                            {file[detail]}
                                        </CardDescription>
                                    </div>
                                ))}
                        </CardContent>
                    </Card>
                )
            ))}
        </div>
    )
}

export default GoogleFileDetails