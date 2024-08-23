import axios from "axios";

export const maxDuration = 300;
export async function POST(req: Request, res: Response) {

  try {
    const {
       name, description, initialMessage, prompt, llmProvider, llmModel, workflowId
    } = await req.json();

    const url = `https://api.spaceship.im/api/v1/agents`;
    const data = {
        name: name,
        description: description,
        initialMessage: initialMessage,
        prompt: prompt,
        llmProvider: llmProvider || "OPENAI",
        llmModel: llmModel || "GPT_4_O"
    }
    const options = {
        headers: {
          accept: "application/json",
          Authorization:
          `Bearer ${process.env.SUPERAGENT_API}`,
        },
    }

    const response = await axios.post(url,data, options);
    const final = JSON.stringify(response.data);
    return new Response(final, {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
  } catch (error: any) {
    console.error("Error during Superagent API call:", error);
    return new Response("error", {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
