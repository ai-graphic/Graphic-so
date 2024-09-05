import Navbar from "@/components/global/navbar";
import { FadeIn } from "@/components/cult/fade-in";
import {
  EmptyFeaturedGrid,
  FeaturedGrid,
  ResourceCardGrid,
} from "@/components/directory-card-grid";
import { DirectorySearch } from "@/components/directory-search";
import { Hero } from "@/components/hero";
import { Suspense } from "react";
import { getAllWorkflows } from "./actions";

export default async function Home() {
  const isValidImageUrl = (url: string) => {
    return /\.(jpeg|jpg|gif|png|webp)$/.test(url);
  };

  const workflows = await getAllWorkflows();
  console.log("hello", workflows);

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
      featured: logo_src && isValidImageUrl(logo_src) && logo_src,
      logo_src: logo_src && isValidImageUrl(logo_src) && logo_src,
      tags: [], 
      labels: [], 
      categories: "",
    };
  });

  const filteredFeaturedData = data.filter(
    (product) => product.featured
  );

  return (
    <main>
      <Navbar />

      <div className="w-full px-2 md:px-4 flex mt-40">
        <FadeIn>
          <ResourceCardGrid
            sortedData={data}
            filteredFeaturedData={filteredFeaturedData}
          >
            <div className="grid grid-cols-1 xl:grid-cols-6 lg:gap-16 pb-8 pt-8">
              <div className="col-span-1 md:col-span-2 z-10">
                <Hero>
                  <DirectorySearch />
                </Hero>
              </div>

              <div className="col-span-1 md:col-span-4 mt-6 md:mt-0">
                {filteredFeaturedData.length >= 1 ? (
                  <Suspense fallback={<div>Loading...</div>}>
                    <div className="relative">
                      <FeaturedGrid featuredData={filteredFeaturedData} />
                    </div>
                  </Suspense>
                ) : (
                  <div className="relative">
                    <EmptyFeaturedGrid />
                  </div>
                )}
              </div>
            </div>
          </ResourceCardGrid>
        </FadeIn>
      </div>
    </main>
  );
}
