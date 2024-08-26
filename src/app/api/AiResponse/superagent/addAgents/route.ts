import axios from "axios";

export const maxDuration = 300;
export async function POST(req: Request, res: Response) {

  try {
    const {
        Agents, workflowId, steps
    } = await req.json();

    const url = `https://api.spaceship.im/api/v1/workflows/${workflowId}/steps`;
    const data = {
      // Define the request body
      order: steps,
      agentId: Agents, // Assuming 'Agents' holds the agentId you want to use
    };
    const options = {
      headers: {
        accept: "application/json",
        Authorization:
          `Bearer ${process.env.SUPERAGENT_API}`,
      },
    };

    axios
      .post(url, data, options) // Include 'data' as the second argument
      .then((response) => {
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
      });
      return new Response("success",  {});
  } catch (error: any) {
    console.error("Error during Superagent API call:", error);
    return new Response("error", {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}