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
                    className="flex font-bold flex-row"
                >
                    WorkflowAi.
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
                <Separator />
                <div className="flex items-center flex-col gap-9 dark:bg-[#353346]/30
                py-4 px-2 rounded-full h-56 overflow-scroll border-[1px]">
                    <div className="relative dark:bg-[#353346]/70 p-2 rounded-full
                    dark:border-t-[2px] border-[1px] dark:border-t-[#353346]">
                        <LucideMousePointerClick
                            className="dark:text-white"
                            size={18}
                        />
                        <div className="border-l-2 border-muted-foreground/50 h-6
                        absolute left-1/2 transform translate-x-[-50%] -bottom-[30px]" />
                    </div>
                    <div className="relative dark:bg-[#353346]/70 p-2 rounded-full
                    dark:border-t-[2px] border-[1px] dark:border-t-[#353346]">
                        <GitBranch
                            className="dark:text-white"
                            size={18}
                        />
                        <div className="border-l-2 border-muted-foreground/50 h-6
                        absolute left-1/2 transform translate-x-[-50%] -bottom-[30px]" />
                    </div>
                    <div className="relative dark:bg-[#353346]/70 p-2 rounded-full
                    dark:border-t-[2px] border-[1px] dark:border-t-[#353346]">
                        <Database
                            className="dark:text-white"
                            size={18}
                        />
                        <div className="border-l-2 border-muted-foreground/50 h-6
                        absolute left-1/2 transform translate-x-[-50%] -bottom-[30px]" />
                    </div>
                    <div className="relative dark:bg-[#353346]/70 p-2 rounded-full
                    dark:border-t-[2px] border-[1px] dark:border-t-[#353346]">
                        <GitBranch
                            className="dark:text-white"
                            size={18}
                        />
                    </div>
                </div>
            </div>
            <div className="flex items-center justify-center flex-col gap-8">
                <ModeToggle />
            </div>
        </nav>
    );
};
export default MenuOptions;
