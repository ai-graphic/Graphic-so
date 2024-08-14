// import Replicate from "replicate";

// export async function POST(req: Request, res: Response) {

//   try {
//     const {
//       prompt,
//       apiKey,
//       temperature,
//       maxTokens,
//       num_outputs,
//       aspect_ratio,
//       output_format,
//       guidance_scale,
//       output_quality,
//       num_inference_steps,
//     } = await req.json();

//     const replicate = new Replicate({
//       auth: apiKey,
//     });

//     const training = await replicate.trainings.create(
//         "lucataco",
//         "ai-toolkit",
//         "155ed0053b5ec0a9ef5345e8bd64fa4a1e8e8630b27fdb4545d36fb375cb2abb",
//         {
//           destination: "model-owner/model-name",
//           input: {
//             input_images: "https://my-domain/training-images.zip"
//           }
//         }
//       );
//     console.log("training output :", training);
//     const finaloutput = JSON.stringify(training);
//     return new Response(finaloutput, {
//       status: 200,
//       headers: { "Content-Type": "application/json" },
//     });
//   } catch (error: any) {
//     console.error("Error during Replicate API call:", error);
//     return new Response("error", {
//       status: 500,
//       headers: { "Content-Type": "application/json" },
//     });
//   }
// }
