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
import { useBilling } from "@/providers/billing-provider";
import { onPaymentDetails } from "@/app/(main)/(pages)/billing/_actions/payment-connections";

type Props = {};
const MenuOptions = (props: Props) => {
  const pathName = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const isControllable = pathName.includes("editor");
  const { credits, tier, setCredits, setTier } = useBilling();

  const onGetPayment = async () => {
    const response = await onPaymentDetails();
    console.log(response);
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
    <div className="relative">
      {!isVisible && isControllable ? (
        <Button
          variant="outline"
          className="absolute z-10 top-0 left-0 m-2 p-2 text-white"
          onClick={() => setIsVisible(true)} // Show the menu
        >
          <ChevronsRight />
        </Button>
      ) : (
        <motion.nav
          className={`dark:bg-black h-screen overflow-scroll justify-between flex items-center flex-col gap-10 py-6 px-2 ${
            isVisible ? "menu-enter-active" : "menu-exit-active"
          }`}
          variants={sidebarVariants}
          initial="closed"
          animate={isVisible ? "open" : "closed"}
        >
          <div className="flex items-center justify-center flex-col gap-8">
            <Link href="/" className="flex font-bold m-2 flex-row">
              graphic.so
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
                          <menuItem.Component
                            selected={pathName === menuItem.href}
                          />
                        </Link>
                      </li>
                    </TooltipTrigger>
                  </Tooltip>
                </ul>
              ))}

              {isControllable && (
                <Button
                  variant="outline"
                  className="m-2 p-2"
                  onClick={() => setIsVisible(false)}
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
