"use client";

import { useEffect, useState } from 'react';

// Declare the gradio-app custom element to prevent React warnings
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'gradio-app': any;
    }
  }
}

const TemplatePage = () => {
    const [rxc, setRxc] = useState("https://seshubon-kolors1.hf.space?uuid=244");
  useEffect(() => {
    // Dynamically load the Gradio JS library
    const script = document.createElement('script');
    script.src = "https://gradio.s3-us-west-2.amazonaws.com/4.41.0/gradio.js"
    ;
    script.type = 'module';
    document.body.appendChild(script);

    return () => {
      // Cleanup the script when the component unmounts
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="flex flex-col gap-4 relative text-center">
      <h1 className="text-4xl sticky-top-0 z-[10] p-6 bg-background/50 backdrop-blur-lg flex items-center border-b">
        Templates
      </h1>
      <div className="grid grid-cols-2 gap-4">
        <div className="border-b">
          Web component
          <gradio-app src={rxc}></gradio-app>
        </div>
        <div className="border-b gap-2 flex flex-col">
          Iframe
          <iframe
          className="border-2 rounded-xl m-3  "
            src={rxc}
            width="100%"
            height="100%%"
          ></iframe>
        </div>
    </div>
    </div>
  );
};

export default TemplatePage;