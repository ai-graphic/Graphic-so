'use client'

import UploadCareButton from "@/app/(main)/(pages)/settings/_components/uploadcare-button";
import {useRouter} from "next/navigation";
import Image from "next/image";
import {Button} from "@/components/ui/button";
import {X} from "lucide-react";

type Props = {
    userImage: string | null;
    onDelete?: any;
    onUpload?: any;
};
const ProfilePicture = ({userImage, onDelete, onUpload}: Props) => {
    const router = useRouter();

    const onRemoveProfileImage = async () => {
        const res = await onDelete();
        if (res) router.refresh();
    }

    return (
        <div className="flex flex-col gap-3 w-full justify-start items-start">
            <p className="text-lg text-white">
                Profile Picture
            </p>
            <div className="flex h-[30vh] w-full flex-col justify-start items-center">

                {userImage
                    ? (
                        <>
                            <div className="relative h-full flex  w-3/4">
                                <Image
                                    src={userImage}
                                    alt="userImage"
                                    fill
                                />
                            </div>
                            <Button
                                onClick={onRemoveProfileImage}
                                className="bg-transparent text-white/70
                                hover:bg-transparent hover:text-white"
                            >
                                <X /> Remove Logo
                            </Button>
                        </>
                    )
                    : (
                        <UploadCareButton onUpload={onUpload} />
                        // <div>hi</div>
                    )
                }


            </div>
        </div>
    );
};
export default ProfilePicture;
