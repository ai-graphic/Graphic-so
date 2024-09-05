import { FadeIn } from "@/components/cult/fade-in";
import { ResourceCardGrid } from "@/components/directory-card-grid";
import { getAllWorkflows } from "@/app/actions";

interface Product {
  id: string
  created_at: string
  full_name: string
  email: string
  twitter_handle: string
  product_website: string
  codename: string
  punchline: string
  description: string
  logo_src: string
  user_id: string
  tags: string[]
  view_count: number
  approved: boolean
  labels: string[]
  categories: string
}

const DashboardPage = async () => {
  const isValidImageUrl = (url: string) => {
    return /\.(jpeg|jpg|gif|png|webp)$/.test(url);
  };

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
      email: "",
      twitter_handle: "",
      product_website: "",
      codename: workflow.name,
      punchline: workflow.description,
      description: workflow.description,
      user_id: workflow.userId,
      view_count: 0,
      approved: false,
      featured: workflow.publish,
      logo_src: logo_src && isValidImageUrl(logo_src) && logo_src,
      tags: [], 
      labels: [], 
      categories: "",
    };
  });

  const filteredFeaturedData: Product[] = data.filter(
    (product) => product.featured
  );

  return (
    <div className="flex flex-col gap-4 relative">
      <h1 className="text-4xl sticky-top-0 z-[10] p-6 flex items-center border-b">
        Dashboard
      </h1>
      <div className="w-full px-2 md:px-4 flex flex-col">
        <FadeIn>
          <ResourceCardGrid
            sortedData={data}
            filteredFeaturedData={filteredFeaturedData}
          ></ResourceCardGrid>
        </FadeIn>
      </div>
    </div>
  );
};

export default DashboardPage;
