import { Wifi, Battery } from "lucide-react";

interface StatusBarProps {
  currentTime: string;
}

export default function StatusBar({ currentTime }: StatusBarProps) {
  return (
    <div className="w-full flex justify-between items-center mb-4 text-sm font-medium">
      <span className="bg-opacity-50 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full">{currentTime}</span>
      <div className="flex items-center space-x-3">
        <Wifi size={18} className="text-cyan-500" />
        <Battery size={18} className="text-green-500" />
      </div>
    </div>
  );
}