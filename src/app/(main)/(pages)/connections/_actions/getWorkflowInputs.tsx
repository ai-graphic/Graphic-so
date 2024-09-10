"use server";

export const getWorkflowInput = async (
  flow: any,
  content: string,
  id: string,
  type: string
) => {
  let finalcontent; 
  const edgesArray = JSON.parse(flow.edges);
  const nodeArray = JSON.parse(flow.nodes)

  if (Array.isArray(edgesArray)) {
    const edge = edgesArray.find(e => e.target === id);
    const node = nodeArray.find((n:any) => n.id === edge.source);

    if (node.type === "AI") {
        const aiTemplate = JSON.parse(flow.AiTemplate!);
        const output = aiTemplate.output[node.id][0];
        finalcontent = output;
    } else {
        finalcontent = content;
    }
  }
  return String(finalcontent);
};
