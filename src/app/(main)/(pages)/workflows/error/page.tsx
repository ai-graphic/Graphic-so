import Link from "next/link";
import { ShieldBan } from 'lucide-react'

const ErrorPage = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center p-4">
      <ShieldBan className="h-16 w-16 text-red-500" />
      <h1 className="text-3xl font-bold mt-4">Error</h1>
      <p className="mt-2 text-center">You are not authorized to view this workflow.</p>
      <Link href="/workflows" className="mt-4 text-blue-500 hover:underline">Go to your Workflow</Link>
    </div>
  );
};

export default ErrorPage;