import Image from "next/image";
import Logo from "../../../public/fuzzieLogo.png";
import Link from "next/link";
import { MenuIcon } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { ModeToggle } from "./mode-toggle";

type Props = {};
const Navbar = async (props: Props) => {
  const user = await currentUser();
  return (
    <header
      className="fixed right-0 left-0 top-0 py-4 px-4  backdrop-blur-lg
        z-[100] flex items-center  justify-between"
    >
      <aside className="flex items-center gap-[5px]">
        <Image
          src="/logo.webp"
          alt="logo"
          width={35}
          height={35}
          className="shadow-sm rounded-lg"
        />
      </aside>
      <aside className="flex items-center gap-4 z-10000">
        <ModeToggle />
        <Link
          href="/workflows"
          className="relative inline-flex h-10 overflow-hidden
                    rounded-full p-[2px] focus:outline-none focus:ring-2
                    focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
        >
          <span
            className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite]
                    bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]"
          />
          <span
            className="inline-flex h-full w-full cursor-pointer items-center
                    justify-center rounded-full bg-slate-950 px-3 py-1 text-sm font-medium
                    text-white backdrop-blur-3xl"
          >
            {user ? "Worflows" : "Get Started"}
          </span>
        </Link>
        {user ? <UserButton /> : null}
      </aside>
    </header>
  );
};
export default Navbar;
