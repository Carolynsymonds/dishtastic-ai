import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Smartphone, Square, Monitor, Clock } from "lucide-react";

interface VideoConfig {
  scale: string;
  length: number;
  videoStyle: string;
  background: string;
}

interface OptionsDialogProps {
  onConfigChange?: (config: VideoConfig) => void;
}

export default function OptionsDialog({ onConfigChange }: OptionsDialogProps) {
  const [config, setConfig] = useState<VideoConfig>({
    scale: "Landscape",
    length: 5,
    videoStyle: "realistic",
    background: "natural"
  });

  const [isOpen, setIsOpen] = useState(false);

  const handleConfigChange = (key: keyof VideoConfig, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    onConfigChange?.(newConfig);
  };

  const handleSave = () => {
    onConfigChange?.(config);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-1.5 px-2 py-1 text-[8px] md:text-[10px] rounded-md bg-muted hover:bg-muted/80 text-foreground border border-border shadow-sm">
          <Settings className="w-3 h-3" />
          <span>Options</span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-background border border-input text-foreground">
        <DialogHeader>
          <DialogTitle className="text-foreground">Configuration</DialogTitle>
          
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Scale Configuration */}
          <div className="space-y-3">
            <Label className="text-foreground font-medium">
              Scale
            </Label>
            <div className="flex gap-2">
              <Button
                variant={config.scale === "Portrait" ? "default" : "outline"}
                size="sm"
                onClick={() => handleConfigChange('scale', 'Portrait')}
                className={`flex items-center gap-2 ${config.scale === "Portrait" ? "bg-black text-white hover:bg-gray-800" : ""}`}
              >
                <Smartphone className="w-4 h-4" />
                Portrait
              </Button>
              <Button
                variant={config.scale === "Square" ? "default" : "outline"}
                size="sm"
                onClick={() => handleConfigChange('scale', 'Square')}
                className={`flex items-center gap-2 ${config.scale === "Square" ? "bg-black text-white hover:bg-gray-800" : ""}`}
              >
                <Square className="w-4 h-4" />
                Square
              </Button>
              <Button
                variant={config.scale === "Landscape" ? "default" : "outline"}
                size="sm"
                onClick={() => handleConfigChange('scale', 'Landscape')}
                className={`flex items-center gap-2 ${config.scale === "Landscape" ? "bg-black text-white hover:bg-gray-800" : ""}`}
              >
                <Monitor className="w-4 h-4" />
                Landscape
              </Button>
            </div>
          </div>

          {/* Length Configuration */}
          <div className="space-y-3">
            <Label className="text-foreground font-medium">
              Length
            </Label>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={config.length === 1 ? "default" : "outline"}
                size="sm"
                onClick={() => handleConfigChange('length', 1)}
                className={`flex items-center gap-2 ${config.length === 1 ? "bg-black text-white hover:bg-gray-800" : ""}`}
              >
                <Clock className="w-4 h-4" />
                1s
              </Button>
              <Button
                variant={config.length === 2 ? "default" : "outline"}
                size="sm"
                onClick={() => handleConfigChange('length', 2)}
                className={`flex items-center gap-2 ${config.length === 2 ? "bg-black text-white hover:bg-gray-800" : ""}`}
              >
                <Clock className="w-4 h-4" />
                2s
              </Button>
              <Button
                variant={config.length === 5 ? "default" : "outline"}
                size="sm"
                onClick={() => handleConfigChange('length', 5)}
                className={`flex items-center gap-2 ${config.length === 5 ? "bg-black text-white hover:bg-gray-800" : ""}`}
              >
                <Clock className="w-4 h-4" />
                5s
              </Button>
              <Button
                variant={config.length === 10 ? "default" : "outline"}
                size="sm"
                onClick={() => handleConfigChange('length', 10)}
                className={`flex items-center gap-2 ${config.length === 10 ? "bg-black text-white hover:bg-gray-800" : ""}`}
              >
                <Clock className="w-4 h-4" />
                10s
              </Button>
              <Button
                variant={config.length === 15 ? "default" : "outline"}
                size="sm"
                onClick={() => handleConfigChange('length', 15)}
                className={`flex items-center gap-2 ${config.length === 15 ? "bg-black text-white hover:bg-gray-800" : ""}`}
              >
                <Clock className="w-4 h-4" />
                15s
              </Button>
            </div>
          </div>

          {/* Video Style Configuration */}
          <div className="space-y-3">
            <Label htmlFor="videoStyle" className="text-foreground font-medium">
              Video Style
            </Label>
            <Select
              value={config.videoStyle}
              onValueChange={(value) => handleConfigChange('videoStyle', value)}
            >
              <SelectTrigger className="bg-background border border-input text-foreground">
                <SelectValue placeholder="Select video style" />
              </SelectTrigger>
              <SelectContent className="bg-background border border-input">
                <SelectItem value="realistic" className="text-foreground hover:bg-accent hover:text-accent-foreground">
                  Realistic
                </SelectItem>
                <SelectItem value="cinematic" className="text-foreground hover:bg-accent hover:text-accent-foreground">
                  Cinematic
                </SelectItem>
                <SelectItem value="artistic" className="text-foreground hover:bg-accent hover:text-accent-foreground">
                  Artistic
                </SelectItem>
                <SelectItem value="documentary" className="text-foreground hover:bg-accent hover:text-accent-foreground">
                  Documentary
                </SelectItem>
                <SelectItem value="commercial" className="text-foreground hover:bg-accent hover:text-accent-foreground">
                  Commercial
                </SelectItem>
                <SelectItem value="social" className="text-foreground hover:bg-accent hover:text-accent-foreground">
                  Social Media
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Background Configuration */}
          <div className="space-y-3">
            <Label htmlFor="background" className="text-foreground font-medium">
              Background
            </Label>
            <Select
              value={config.background}
              onValueChange={(value) => handleConfigChange('background', value)}
            >
              <SelectTrigger className="bg-background border border-input text-foreground">
                <SelectValue placeholder="Select background" />
              </SelectTrigger>
              <SelectContent className="bg-background border border-input">
                <SelectItem value="natural" className="text-foreground hover:bg-accent hover:text-accent-foreground">
                  Natural
                </SelectItem>
                <SelectItem value="studio" className="text-foreground hover:bg-accent hover:text-accent-foreground">
                  Studio
                </SelectItem>
                <SelectItem value="outdoor" className="text-foreground hover:bg-accent hover:text-accent-foreground">
                  Outdoor
                </SelectItem>
                <SelectItem value="kitchen" className="text-foreground hover:bg-accent hover:text-accent-foreground">
                  Kitchen
                </SelectItem>
                <SelectItem value="restaurant" className="text-foreground hover:bg-accent hover:text-accent-foreground">
                  Restaurant
                </SelectItem>
                <SelectItem value="transparent" className="text-foreground hover:bg-accent hover:text-accent-foreground">
                  Transparent
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="border-border text-foreground hover:bg-accent hover:text-accent-foreground"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-black text-white hover:bg-gray-800"
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
