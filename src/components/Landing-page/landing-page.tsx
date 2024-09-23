"use client";

import React, { useState } from "react";
import { FadeIn } from "@/components/Landing-page/cult/fade-in";
import {
  EmptyFeaturedGrid,
  FeaturedGrid,
  ResourceCardGrid,
} from "@/components/Landing-page/directory-card-grid";
import { DirectorySearch } from "@/components/Landing-page/directory-search";
import { Hero } from "@/components/Landing-page/hero";
import { Suspense } from "react";
import { Product } from "@/lib/types";

export function LandingPage({
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
    <div className="w-full px-2 md:px-4 flex mt-40 max-sm:mt-10">
      <FadeIn>
        <ResourceCardGrid
          sortedData={currentData}
          filteredFeaturedData={filteredFeaturedData} 
          setCurrentData={setCurrentData}
          publishedData={publishedData}
          sharedData={sharedData}
        >
          <div className="grid grid-cols-1 xl:grid-cols-6 lg:gap-16 pb-8 pt-8 custom-grid">
            <div className="col-span-1 md:col-span-2 z-10">
              <Hero>
                <DirectorySearch
                  setCurrentData={setCurrentData}
                  publishedData={publishedData}
                  sharedData={sharedData}
                  filteredFeaturedData={filteredFeaturedData}
                />
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
  );
}
