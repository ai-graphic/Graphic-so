"use client";

import React, { useState } from "react";
import { FadeIn } from "@/components/Landing-page/cult/fade-in";
import { ResourceCardGrid } from "@/components/Landing-page/directory-card-grid";
import { DirectorySearch } from "@/components/Landing-page/directory-search";
import { Product } from "@/lib/types";

export function Feed({
  filteredFeaturedData,
  publishedData,
  sharedData,
}: {
  filteredFeaturedData: Product[];
  publishedData: Product[];
  sharedData: Product[];
}) {
  const [currentData, setCurrentData] = useState(publishedData);

  return (
    <div className="w-full mt-2 flex">
      <FadeIn>
        <ResourceCardGrid
          sortedData={currentData}
          filteredFeaturedData={filteredFeaturedData}
        >
          <DirectorySearch
            setCurrentData={setCurrentData}
            publishedData={publishedData}
            sharedData={sharedData}
            filteredFeaturedData={filteredFeaturedData}
          />
        </ResourceCardGrid>
      </FadeIn>
    </div>
  );
}
