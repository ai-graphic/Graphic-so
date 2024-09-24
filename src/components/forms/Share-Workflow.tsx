import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { WorkflowFormSchema } from "@/lib/types";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  onCreateWorkflow,
  ondublicateWorkflow,
} from "@/app/(main)/(pages)/workflows/_actions/worflow-connections";
import { useModal } from "@/hooks/modal-provider";

type Props = {
  id: string;
  title?: string;
  subTitle?: string;
  url: string | null;
};
const ShareWorkflow = ({ id, title, subTitle, url }: Props) => {
  const { setClose } = useModal();
  const form = useForm<z.infer<typeof WorkflowFormSchema>>({
    mode: "onChange",
    resolver: zodResolver(WorkflowFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const isLoading = form.formState.isSubmitting;
  const router = useRouter();

  const handleSubmit = async (values: z.infer<typeof WorkflowFormSchema>) => {
    const workflow = await ondublicateWorkflow(
      values.name,
      values.description,
      id,
      true,
      url ?? undefined
    );
    if (workflow) {
      toast.message(workflow.message);
      router.push(`/workflows/editor/${workflow.workflowid}`);
    } else {
      toast.message("Error duplicating workflow");
    }
    setClose();
  };

  return (
    <Card className="w-full max-w-[650px] border-none">
      {title && subTitle && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{subTitle}</CardDescription>
        </CardHeader>
      )}
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col gap-4 text-left mt-10"
          >
            <FormField
              disabled={isLoading}
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name of the new Workflow</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={isLoading}
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Description" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="mt-4" disabled={isLoading} type="submit">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-sping" /> Doing the
                  Magic
                </>
              ) : (
                "Share Workflow"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
export default ShareWorkflow;
