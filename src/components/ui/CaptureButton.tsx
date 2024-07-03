import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CaptureButtonProps {
  onClick: () => void;
}

export default function CaptureButton({ onClick }: CaptureButtonProps) {
  return (
    <div className="w-1/2 flex justify-start p-4">
      <Button 
        onClick={onClick} 
        className="flex items-center px-6 py-3 text-lg font-semibold rounded-lg shadow-md bg-blue-600 text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-300"
      >
        <Camera size={24} className="mr-2" />
        Capture
      </Button>
    </div>
  );
}