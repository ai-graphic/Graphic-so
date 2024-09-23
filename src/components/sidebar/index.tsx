"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { menuOptions } from "@/lib/constants";
import { clsx } from "clsx";
// Removed unused imports for brevity
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { ModeToggle } from "@/components/global/mode-toggle";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { motion } from "framer-motion";
import { UserButton } from "@clerk/nextjs";
import { useBilling } from "@/hooks/billing-provider";
import { onPaymentDetails } from "@/app/(main)/(pages)/billing/_actions/payment-connections";
import Image from "next/image";

type Props = {};
const MenuOptions = (props: Props) => {
  const pathName = usePathname();
  const [isVisible, setIsVisible] = useState(
    pathName.includes("chat") ? false : true
  );
  const isControllable = pathName.includes("editor");
  const { credits, tier, setCredits, setTier } = useBilling();

  const onGetPayment = async () => {
    const response = await onPaymentDetails();
    if (response) {
      setTier(response.tier!);
      setCredits(response.credits!);
    }
  };

  useEffect(() => {
    onGetPayment();
  }, [credits]);

  const sidebarVariants = {
    open: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } },
    closed: {
      x: "-50%",
      opacity: 0,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <div
      className={
        pathName.includes("chat") ? "absolute top-0 left-0 z-10 border-2" : "relative"
      }
    >
      {!isVisible && isControllable ? (
        <Button
          variant="outline"
          className="absolute z-10 top-0 left-0 m-2 p-2 dark:text-white text-black"
          onClick={() => setIsVisible(true)} // Show the menu
        >
          <ChevronsRight />
        </Button>
      ) : (
        <motion.nav
          className={`dark:bg-black  xl:px-4 h-screen overflow-scroll justify-between flex items-center flex-col gap-10 py-6 px-2 ${
            isVisible ? "menu-enter-active" : "menu-exit-active"
          }`}
          variants={sidebarVariants}
          initial="closed"
          animate={isVisible ? "open" : "closed"}
        >
          <div className="flex items-center justify-center flex-col gap-8 mx-4">
            <Link href="/" className="flex font-bold flex-row ">
              <Image
                src="/logo.webp"
                alt="logo"
                width={35}
                height={35}
                className="shadow-sm rounded-lg"
              />
            </Link>
            <TooltipProvider>
              {menuOptions.map((menuItem) => (
                <ul key={menuItem.name}>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger>
                      <li>
                        <Link
                          href={menuItem.href}
                          className={clsx(
                            "group h-8 w-8 flex items-center justify-center scale-[1.5] rounded-lg p-[3px] cursor-pointer",
                            {
                              "dark:bg-[#2F006B] bg-[#EEE0FF]":
                                pathName === menuItem.href,
                            }
                          )}
                        >
                          <menuItem.Component size={20} />
                        </Link>
                      </li>
                    </TooltipTrigger>
                    <TooltipContent >{menuItem.name}</TooltipContent>
                  </Tooltip>
                </ul>
              ))}

              {isControllable && (
                <Button
                  variant="outline"
                  onClick={() => setIsVisible(false)}
                  className="px-1 -mx-1"
                >
                  <ChevronsLeft />
                </Button>
              )}
            </TooltipProvider>
          </div>
          <div className="flex items-center justify-center flex-col gap-8">
            <div className="flex text-sm text-orange-400">
              {tier == "Unlimited" ? (
                <span>Unlimited</span>
              ) : (
                <span>
                  {credits}/{tier == "Free" ? "40" : tier == "Pro" && "100"}
                </span>
              )}
            </div>
            <ModeToggle />
            <UserButton />
          </div>
        </motion.nav>
      )}
    </div>
  );
};
export default MenuOptions;
