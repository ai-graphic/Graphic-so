import Workflow from "@/app/(main)/(pages)/workflows/_components/workflow";
import { onGetWorkflows } from "@/app/(main)/(pages)/workflows/_actions/worflow-connections";
import MoreCredits from "@/app/(main)/(pages)/workflows/_components/more-credits";

type Props = {};
const Workflows = async (props: Props) => {
  const workflows = await onGetWorkflows();
  return (
    <div className="relative flex flex-col gap-4">
      <section className="flex flex-col m-2">
        <MoreCredits />
        {workflows?.length ? (
          workflows.map((flow) => <Workflow key={flow.id} {...flow} />)
        ) : (
          <div className="mt-28 text-muted-foreground flex items-center justify-center">
            No workflows yet? Start orchestrating your business automation by
            creating your first graphic now!
          </div>
        )}
      </section>
    </div>
  );
};
export default Workflows;
