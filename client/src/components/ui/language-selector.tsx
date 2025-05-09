import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function LanguageSelector() {
  const [language, setLanguage] = useState("en");
  
  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    // In a real application, this would change the application language
    // For this demo, we're just storing the selected language
  };
  
  return (
    <div className="relative language-selector">
      <Select value={language} onValueChange={handleLanguageChange}>
        <SelectTrigger className="appearance-none bg-transparent border border-neutral-light rounded px-3 py-1 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-primary h-auto w-auto min-w-[100px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">English</SelectItem>
          <SelectItem value="bn">বাংলা</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
