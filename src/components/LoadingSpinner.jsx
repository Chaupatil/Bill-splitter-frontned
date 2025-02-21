import { Loader2 } from "lucide-react";

const LoadingSpinner = () => (
  <div className="fixed inset-0 flex justify-center items-center z-50">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

export default LoadingSpinner;
