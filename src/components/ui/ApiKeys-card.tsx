"use client";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { toast } from "sonner";

const ApikeyCard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openAIKey, setOpenAIKey] = useState("");
  const [replicateKey, setReplicateKey] = useState("");

  const handleSaveKeys = () => {
    localStorage.setItem("Openai", openAIKey);
    localStorage.setItem("FLUX-image", replicateKey);
    setIsModalOpen(false); // Close the modal after saving
  };
  useEffect(() => {
    const openai = localStorage.getItem("Openai");
    const fluxImage = localStorage.getItem("FLUX-image");
    if (openai && fluxImage) {
      setOpenAIKey(openai);
      setReplicateKey(fluxImage);
    }
  }, []);

  return (
    <Card className="flex w-full items-center justify-between">
      <CardHeader className="flex flex-col gap-4">
        <div className="flex flex-row gap-2">
          <Image
            src="/ai.png"
            alt="Api Key"
            height={30}
            width={30}
            className="object-contain"
          />
        </div>
        <div>
        <CardTitle className="text-lg">API Key Configuration</CardTitle>
        <CardDescription>Enter your OpenAI and Replicate API keys below to autofil.</CardDescription>
        </div>
      </CardHeader>
      <div className="flex flex-col items-center gap-2 p-4">
        <button
          onClick={() => setIsModalOpen((prev) => !prev)}
          className=" rounded-lg bg-primary p-2 font-bold text-primary-foreground"
        >
         {openAIKey && replicateKey ? "Edit" : "Connect"} 
        </button>
      </div>
      {isModalOpen && (
        <div className="fixed min-w-[70vh] inset-0 bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-900 p-4 rounded-lg">
            <h1 className="text-lg text-gray-300">Save Your Api Keys</h1>
            <p className="text-sm text-gray-500">OpenAi Key</p>
            <input
              type="text"
              placeholder="Enter OpenAI Key"
              className="text-white bg-gray-800 p-2 rounded my-2 w-full"
              value={openAIKey}
              onChange={(e) => setOpenAIKey(e.target.value)}
            />
            <p className="text-sm text-gray-500">Replicate Key</p>
            <input
              type="text"
              placeholder="Enter Replicate Key"
              className="text-white bg-gray-800 p-2 rounded my-2 w-full"
              value={replicateKey}
              onChange={(e) => setReplicateKey(e.target.value)}
            />

            <button
              onClick={handleSaveKeys}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 my-2 px-4 rounded"
            >
              Submit
            </button>
            <button
              onClick={() => setIsModalOpen(false)}
              className="bg-transparent ml-4 hover:bg-gray-500 text-white font-semibold py-2 px-4 border border-white rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </Card>
  );
};
export default ApikeyCard;
