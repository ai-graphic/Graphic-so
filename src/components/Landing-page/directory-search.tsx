"use client";
import { Product } from "@/lib/types";
import { Button } from "../ui/button";
import { useState } from "react";

interface Props {
  setCurrentData: (data: Product[]) => void;
  publishedData: Product[];
  sharedData: Product[];
  filteredFeaturedData: Product[];
}

export function DirectorySearch({
  setCurrentData,
  publishedData,
  sharedData,
  filteredFeaturedData,
}: Props) {
  const [activeButton, setActiveButton] = useState<string>("UserFeed");

  return (
    <div className="relative max-w-[90%] gap-3 md:min-w-[4rem] w-full md:max-w-[42ch] md:mr-auto flex justify-center items-center">
      <Button
        variant="secondary"
        onClick={() => {
          setCurrentData(publishedData);
          setActiveButton("UserFeed");
        }}
        className={`font-bold py-2 px-8 ${
          activeButton === "UserFeed" && "bg-gray-300 text-black "
        }`}
      >
        User Feed
      </Button>
      <Button
        variant="secondary"
        onClick={() => {
          setCurrentData(filteredFeaturedData);
          setActiveButton("Featured");
        }}
        className={`font-bold py-2 px-8 ${
          activeButton === "Featured" && "bg-gray-300 text-black "
        }`}
      >
        Featured
      </Button>
      <Button
        variant="secondary"
        onClick={() => {
          setCurrentData(sharedData);
          setActiveButton("Shared");
        }}
        className={`font-bold py-2 px-8 ${
          activeButton === "Shared" && "bg-gray-300 text-black "
        }`}
      >
        Latest
      </Button>
    </div>
  );
}
