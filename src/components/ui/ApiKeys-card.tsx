"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { useEffect, useState } from "react";
import {} from "react-hook-form";
import { toast } from "sonner";
import { useForm, FormProvider } from "react-hook-form";
import { FormItem, FormField } from "@/components/ui/form";
import axios from "axios";
import { Button } from "./button";
import { LLMS } from "@/lib/constants";
import { Input } from "./input";

const ApikeyCard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openAIKey, setOpenAIKey] = useState("");
  const [replicateKey, setReplicateKey] = useState("");
  const [loading, setLoading] = useState(false);
  const llmMethod = useForm({
    defaultValues: {
      LLM: "Select LLM",
      Apikey: "",
    },
  });

  useEffect(() => {
    const openai = localStorage.getItem("Openai");
    const fluxImage = localStorage.getItem("FLUX-image");
    if (openai && fluxImage) {
      setOpenAIKey(openai);
      setReplicateKey(fluxImage);
    }
  }, []);

  const Addllm = llmMethod.handleSubmit(async (data) => {
    const { LLM, Apikey } = data;
    try {
      setLoading(true);
      if(LLM === "OPENAI") {
        localStorage.setItem("Openai", Apikey);
      }
      if(LLM === "FLUX-image") {
        localStorage.setItem("FLUX-image", Apikey);
        toast.success("LLM added successfully");
        setLoading(false);
        return;
      }

      const response = await axios.post("/api/AiResponse/superagent/llms", {
        LLM,
        Apikey,
      });
      const llms = await axios.get("/api/AiResponse/superagent/llms");
      toast.success("LLM added successfully");
    } catch (error) {
      console.error("Error adding LLM:", error);
      toast.error("Failed to add LLM. Please try again.");
    } finally {
      setLoading(false);
    }
  });

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
          <CardDescription>
            Enter your OpenAI and Replicate API keys below to autofil.
          </CardDescription>
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
        <CardContent className="fixed inset-0 justify-center items-center bg-black bg-opacity-50 backdrop-blur-sm  P-4 flex">
          <div className="bg-black p-4 rounded-lg border-2 flex flex-col gap-2">
            <h1 className="text-lg text-gray-300">Save Your Api Keys</h1>
            <p className="text-sm text-gray-500">OpenAi Key</p>
            <div className="text-white border-2 p-2 rounded my-2">
              {openAIKey ? openAIKey : "No OpenAI key found"}
            </div>
            <p className="text-sm text-gray-500">Replicate Key</p>
            <div className="text-white border-2 p-2 rounded my-2 ">
              {replicateKey ? replicateKey : "No Replicate key found"}
            </div>
            ADD LLMS
            <FormProvider {...llmMethod}>
              <form className="flex flex-col gap-2" onSubmit={Addllm}>
                <FormItem>
                  <FormField
                    name="LLM"
                    render={({ field }) => (
                      <select {...field} className="border rounded w-full p-2">
                        <option disabled value="Select LLM">
                          Select llm
                        </option>
                        <option value="FLUX-image">Replicate</option>
                        {LLMS.map((llm: any) => (
                          <option key={llm} value={llm}>
                            {llm}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                </FormItem>
                <FormItem>
                  <FormField
                    name="Apikey"
                    render={({ field }) => (
                      <Input {...field} required placeholder="Enter api key" />
                    )}
                  />
                </FormItem>
                <Button onClick={Addllm} type="submit">
                  Add LLm
                </Button>
              </form>
            </FormProvider>
            <button
              onClick={() => setIsModalOpen(false)}
              className="bg-transparent hover:bg-red-200 hover:text-black text-white font-semibold py-2 px-4 border border-white rounded"
            >
              Close
            </button>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
export default ApikeyCard;
