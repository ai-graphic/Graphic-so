"use client";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { onFlowPublish } from "@/app/(main)/(pages)/workflows/editor/[editorId]/_actions/workflow-connections";
import { toast } from "sonner";
import { useState } from "react";

type Props = {
  name: string;
  description: string;
  id: string;
  publish: boolean | null;
};
const Workflow = ({ name, description, id, publish }: Props) => {
  const [localpublish, setPublish] = useState(publish);
  const onPublishFlow = async (event: any) => {
    const response = await onFlowPublish(
      id,
      event.target.ariaChecked === "false"
    );
    if (response) toast.message(response);
  };

  return (
    <Card className="flex w-full items-center justify-between">
      <CardHeader className="flex flex-col gap-4">
        <Link href={`/workflows/editor/${id}`}>
          <div className="flex flex-row gap-2">
            <Image
              src="/discord.png"
              alt="Discord"
              height={30}
              width={30}
              className="object-contain"
            />
            <Image
              src="/openai.ico"
              alt="openai"
              height={34}
              width={34}
              className="object-contain"
            />
            <Image
              src="/claude.ico"
              alt="claude"
              height={30}
              width={30}
              className="object-contain -ml-1"
            />
          </div>
          <div>
            <CardTitle className="text-lg">{name}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </Link>
      </CardHeader>
      <div className="flex flex-col items-center gap-2 p-4">
        <Label htmlFor="airplane-mode" className="text-muted-foreground">
          {publish ? "On" : "Off"}
        </Label>
        <Switch
          id="airplane-mode"
          onClick={(e) => onPublishFlow(e)}
          defaultChecked={localpublish!}
        />
      </div>
    </Card>
  );
};
export default Workflow;
