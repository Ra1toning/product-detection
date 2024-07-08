import { Button } from "@/components/ui/button";
import { Camera, Sun, Moon, Settings } from "lucide-react";

interface ControlButtonsProps {
  isRecording: boolean;
  isDarkMode: boolean;
  toggleRecording: () => void;
  toggleTheme: () => void;
}

export default function ControlButtons({ isRecording, isDarkMode, toggleRecording, toggleTheme }: ControlButtonsProps) {
  return (
    <div className="flex items-center space-x-6">

      <Button
        className={`p-3 rounded-full transition-colors duration-300 shadow-md
                    ${isDarkMode ? 'bg-cyan-500 text-white'  : 'bg-black text-white'}`}
        onClick={toggleTheme}
      >
        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      </Button>

      <Button
        className={`w-16 h-16 rounded-full transition-all duration-300 shadow-lg transform hover:scale-105
                    ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-cyan-500 hover:bg-cyan-600'}`}
        onClick={toggleRecording}
      >
        <Camera size={24} className="text-white" />
      </Button>

      <Button
        className="p-3 rounded-full bg-gray-200 dark:bg-gray-700 shadow-md transition-all duration-300 hover:rotate-90"
      >
        <Settings size={20} className="text-gray-600 dark:text-gray-300" />
      </Button>
    </div>
  );
}