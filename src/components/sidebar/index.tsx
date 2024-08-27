"use client"

import {usePathname} from "next/navigation";
import Link from "next/link";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import {menuOptions} from "@/lib/constants";
import {clsx} from "clsx";
import {AnimatedTooltip} from "@/components/global/animated-tooltip";
import {Separator} from "@/components/ui/separator";
import {Database, GitBranch, LucideMousePointerClick} from "lucide-react";
import {ModeToggle} from "@/components/global/mode-toggle";

type Props = {};
const MenuOptions = (props: Props) => {
    const pathName = usePathname();

    return (
        <nav className="dark:bg-black h-screen overflow-scroll justify-between flex
        items-center flex-col gap-10 py-6 px-2">
            <div className="flex items-center justify-center flex-col gap-8">
                <Link
                    href="/"
                    className="flex font-bold m-2 flex-row"
                >
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
                                                'group h-8 w-8 flex items-center justify-center scale-[1.5] rounded-lg p-[3px] cursor-pointer',
                                                {
                                                    'dark:bg-[#2F006B] bg-[#EEE0FF] ':
                                                        pathName === menuItem.href,
                                                }
                                            )}
                                        >
                                            <menuItem.Component
                                                selected={pathName === menuItem.href}
                                            />
                                            {/*<AnimatedTooltip items={menuOptions} />*/}
                                        </Link>
                                    </li>
                                </TooltipTrigger>
                                <TooltipContent
                                    side={"right"}
                                    className="bg-black/10 backdrop-blur-xl"
                                >
                                    <p>{menuItem.name}</p>
                                </TooltipContent>
                            </Tooltip>
                        </ul>
                    ))}
                </TooltipProvider>
            </div>
            <div className="flex items-center justify-center flex-col gap-8">
                <ModeToggle />
            </div>
        </nav>
    );
};
export default MenuOptions;
