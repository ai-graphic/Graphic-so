import React from "react";
import MenuOptions from "@/components/sidebar";
import InfoBar from "@/components/infobar";
import { BillingProvider } from "@/providers/billing-provider";

type Props = {children: React.ReactNode};
const Layout = (props: Props) => {
    return (
        <div className="flex overflow-hidden overflow-y-hidden h-screen">
            <BillingProvider>
            <MenuOptions />
            <div className="w-full">
                {/* <InfoBar /> */}
                {props.children}
            </div>
            </BillingProvider>
        </div>
    );
};
export default Layout;
