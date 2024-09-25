import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ShareWorkflow from "@/components/forms/Share-Workflow";
import Link from "next/link";
import { isValidUrl } from "@/lib/utils";
import { useState } from "react";
import { BotIcon, Expand, ExternalLink, HistoryIcon } from "lucide-react";
import ContentViewer from "./ContentViewer";
import { usePathname } from "next/navigation";

type Props = {
  bot: string;
  history: string[];
  pathname: string
};

const ContentOptions = ({ bot, history, pathname }: Props) => {
  const [showDialog, setShowDialog] = useState<string | null>(null);
  const [selectedUrl, setSelectedUrl] = useState<string | null>("");

  console.log("pathname", pathname, history, bot);
  return (
    <div className="flex justify-center mt-8">
      <div className="dark:bg-[#0A0A0A] bg-white p-2 m-1 rounded-l-xl rounded-b-none absolute bottom-0 right-0 flex">
        <button
          onClick={() => setShowDialog("history")}
          className="dark:text-gray-400 dark:hover:text-blue-400"
        >
          <HistoryIcon size={20} />
        </button>

        <button
          className="dark:text-gray-400 dark:hover:text-blue-400 ml-2"
          onClick={() => {
            setShowDialog("share");
            setSelectedUrl(bot ?? null);
          }}
        >
          <ExternalLink size={20} />
        </button>
        <button
          className="dark:text-gray-400 dark:hover:text-blue-400 ml-2"
          onClick={() => {
            setShowDialog("expand");
            setSelectedUrl(bot ?? null);
          }}
        >
          <Expand size={20} />
        </button>
      </div>
      {showDialog === "history" && (
        <Dialog
          open={showDialog === "history"}
          onOpenChange={(open) => setShowDialog(open ? "history" : null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Workflow History</DialogTitle>
              <DialogDescription>
                <div className="mt-2 p-2 h-[80vh] overflow-scroll border-t border-gray-300">
                  <div className="flex gap-2">
                    <strong>
                      <BotIcon />
                    </strong>
                    <div>
                      {history?.map((historyItem, historyIndex) => (
                        <div
                          key={historyIndex}
                          className="flex justify-start mb-2"
                        >
                          <div className="p-2 rounded-r-lg rounded-t-lg border border-gray-700 max-w-xs">
                            <ContentViewer url={historyItem} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )}
      {showDialog === "share" && (
        <Dialog
          open={showDialog === "share"}
          onOpenChange={(open) => setShowDialog(open ? "share" : null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share Workflow</DialogTitle>
              <DialogDescription>
                <p>Share this workflow with others!</p>
                <ShareWorkflow
                  id={pathname}
                  url={selectedUrl}
                />
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )}
      {showDialog === "expand" && (
        <Dialog
          open={showDialog === "expand"}
          onOpenChange={(open) => setShowDialog(open ? "expand" : null)}
        >
          <DialogContent className="max-h-[70vh] overflow-scroll">
            <DialogHeader>
              <DialogTitle>Expand View</DialogTitle>
              <DialogDescription>
                {selectedUrl && (
                  <div className="w-full mt-2 flex flex-col gap-4 justify-center items">
                    {isValidUrl(selectedUrl) ? (
                      <div>
                        <Link target="_blank" href={selectedUrl}>
                          {" "}
                          <ContentViewer url={selectedUrl} />
                        </Link>
                        <p>*click to open on different page</p>
                      </div>
                    ) : (
                      <ContentViewer url={selectedUrl} />
                    )}
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ContentOptions;
