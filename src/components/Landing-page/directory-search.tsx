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
    <div className="relative max-w-[90%] gap-3 md:min-w-[4rem] sm:min-w-[2rem] w-full md:max-w-[42ch]  flex justify-center items-center">
      <Button
        variant="secondary"
        onClick={() => {
          setCurrentData(publishedData);
          setActiveButton("UserFeed");
        }}
        className={`font-bold py-2 px-2 sm:px-3 ${
          activeButton === "UserFeed" &&
          "bg-gray-300 text-black hover:bg-gray-300"
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
        className={`font-bold py-2 px-2 sm:px-3 ${
          activeButton === "Featured" &&
          "bg-gray-300 text-black hover:bg-gray-300"
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
        className={`font-bold py-2 px-2 sm:px-3 ${
          activeButton === "Shared" &&
          "bg-gray-300 text-black hover:bg-gray-300"
        }`}
      >
        Latest
      </Button>
    </div>
  );
}
