import axios from "axios";

export const maxDuration = 300;
export async function POST(req: Request, res: Response) {

  try {
    const {
       prompt, workflowId
    } = await req.json();

    const url = `https://api.spaceship.im/api/v1/workflows/${workflowId}/invoke`;
    const data = {
        input: prompt,
        enableStreaming: false
      }
    const options = {
      headers: {
        accept: "application/json",
        'Content-Type': 'application/json', // Explicitly setting Content-Type
        Authorization:
        `Bearer ${process.env.SUPERAGENT_API}`,
      },
      timeout: 10000,
    };
    const response = await axios.post(url, data, options);
    const final = JSON.stringify(response.data.data);
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