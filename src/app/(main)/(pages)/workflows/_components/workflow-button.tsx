'use client'

import {Button} from "@/components/ui/button";
import {Plus} from "lucide-react";
import {useModal} from "@/providers/modal-provider";
import CustomModal from "@/components/global/custom-modal";
import WorkflowForm from "@/components/forms/workflow-forms";
import {useBilling} from "@/providers/billing-provider";

type Props = {};
const WorkflowButton = (props: Props) => {

    const {setOpen, setClose} = useModal();
    const {credits} = useBilling();
    const handleClick = () => {
        // WIP: Wire up credit check from server side to ensure inspect changes cannot be made
        setOpen(
            <CustomModal
                title="Create a Workflow Automation"
                subheading="Workflows are a powerful tool that help you automate tasks"
            >
                <WorkflowForm/>
            </CustomModal>
        )
    }

    return (
        <Button
            size={"icon"}
            {...(credits !== '0'
                    ?
                    {
                        onClick: handleClick,
                    }
                    :
                    {
                        disabled: true,
                    }
            )}
        >
            <Plus/>
        </Button>
    );
};
export default WorkflowButton;
