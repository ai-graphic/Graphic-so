import React from "react";
import MenuOptions from "@/components/sidebar";
import { BillingProvider } from "@/hooks/billing-provider";

type Props = {children: React.ReactNode};
const Layout = (props: Props) => {
    return (
        <div className="flex overflow-hidden overflow-y-hidden h-screen">
            <BillingProvider>
            <MenuOptions />
            <div className="w-full">
                {props.children}
            </div>
            </BillingProvider>
        </div>
    );
};
export default Layout;
