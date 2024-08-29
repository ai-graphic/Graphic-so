import axios from "axios";

export const maxDuration = 300;
export async function POST(req: Request, res: Response) {
  const maxAttempts = 3; // Maximum number of attempts
  let attempt = 0;
  let response;

  while (attempt < maxAttempts) {
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
      };
      const options = {
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${process.env.SUPERAGENT_API}`,
          },
      };

      response = await axios.post(url, data, options);
      if (response.status === 200) { // Assuming 200 is the success status code
        const final = JSON.stringify(response.data);
        console.log("final", final);
        return new Response(final, {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
      }
    } catch (error) {
      attempt++;
      console.error(`Attempt ${attempt} failed:`, error);
    }
  }
  console.error("Error during Superagent API call after 3 attempts");
  return new Response("error", {
    status: 500,
    headers: { "Content-Type": "application/json" },
  });
}