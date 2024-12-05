import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Save, FolderOpen, Share2, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import useSWR from "swr";
import type { ComponentInstance } from "@/lib/components";
import type { Design } from "db/schema";

interface DesignManagerProps {
  currentComponents: ComponentInstance[];
  onLoadDesign: (components: ComponentInstance[]) => void;
}

export default function DesignManager({ currentComponents, onLoadDesign }: DesignManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newDesignName, setNewDesignName] = useState("");
  const { toast } = useToast();
  const { data: designs, mutate } = useSWR<Design[]>("/designs");

  const handleSaveDesign = async () => {
    if (!newDesignName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a design name",
        variant: "destructive",
      });
      return;
    }

    try {
      await fetch("/designs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newDesignName,
          components: currentComponents,
        }),
      });

      toast({
        title: "Success",
        description: "Design saved successfully",
      });

      setNewDesignName("");
      setIsOpen(false);
      mutate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save design",
        variant: "destructive",
      });
    }
  };

  const handleLoadDesign = async (design: Design) => {
    onLoadDesign(design.components);
    setIsOpen(false);
    toast({
      title: "Success",
      description: "Design loaded successfully",
    });
  };

  const handleShare = async (design: Design) => {
    const shareUrl = `${window.location.origin}?design=${design.id}`;
    await navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link Copied",
      description: "Share link has been copied to clipboard",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <FolderOpen className="h-4 w-4" />
          Designs
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Designs</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter design name..."
              value={newDesignName}
              onChange={(e) => setNewDesignName(e.target.value)}
            />
            <Button onClick={handleSaveDesign} className="gap-2">
              <Save className="h-4 w-4" />
              Save Current
            </Button>
          </div>

          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {designs?.map((design) => (
                <Card key={design.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{design.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {new Date(design.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleShare(design)}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleLoadDesign(design)}
                      >
                        Load
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
