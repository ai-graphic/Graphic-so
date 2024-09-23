import Navbar from "@/components/global/navbar";
import { getAllWorkflows } from "./actions";
import { publicDecrypt } from "crypto";
import { LandingPage } from "@/components/Landing-page/landing-page";

const isValidImageUrl = (url: string) => {
  return /\.(jpeg|jpg|gif|png|webp)$/.test(url);
};

export default async function Home() {
  const workflows = await getAllWorkflows();

  const data = workflows.map((workflow: any) => {
    const chatHistory = workflow.chatHistory || [];
    const lastHistory =
      chatHistory.length > 0
        ? JSON.parse(chatHistory[chatHistory.length - 1])
        : null;
    const logo_src = lastHistory && lastHistory.bot;

    return {
      id: workflow.id,
      created_at: workflow.createdAt,
      full_name: workflow.name,
      email: "rohit9804singh@gmail.com",
      twitter_handle: "",
      product_website: "",
      codename: workflow.name,
      punchline: workflow.description,
      description: workflow.description,
      user_id: workflow.userId,
      view_count: 0,
      approved: false,
      featured: workflow.featured,
      logo_src:
        workflow.thumbnail ??
        (logo_src && isValidImageUrl(logo_src) && logo_src),
      tags: [],
      labels: [],
      categories: "",
      publish: workflow.publish || false,
      created: workflow.createdAt,
      shared: workflow.shared,
    };
  });

  const filteredFeaturedData = data
    .filter((product) => product.featured)
    .sort(
      (a, b) => new Date(a.created).getTime() - new Date(b.created).getTime()
    );
  const PublishedData = data
    .filter((product) => (product.publish === true))
    .sort(
      (a, b) => new Date(a.created).getTime() - new Date(b.created).getTime()
    );
  const sharedData = PublishedData.filter((product) => product.shared).sort(
    (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()
  );

  console.log("data", filteredFeaturedData, PublishedData, sharedData);
  return (
    <main>
      <Navbar />

      <LandingPage
        filteredFeaturedData={filteredFeaturedData}
        publishedData={PublishedData}
        sharedData={sharedData}
      />
    </main>
  );
}
