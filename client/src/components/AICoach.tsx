import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import useSWRMutation from "swr/mutation";

interface Message {
  role: "user" | "assistant" | "error";
  content: string;
}

async function sendMessage(url: string, { arg }: { arg: string }) {
  const res = await fetch("/api/ai-coach", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: arg }),
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.details || error.error || "Failed to get response");
  }
  
  return res.json();
}

export default function AICoach() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const { trigger, isMutating } = useSWRMutation("/api/ai-coach", sendMessage);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    
    const userMessage = { role: "user" as const, content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const response = await trigger(input);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.message },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { 
          role: "error", 
          content: error.message || "Failed to get AI response"
        },
      ]);
    }
  };

  return (
    <div className="h-full flex flex-col p-4">
      <h2 className="text-lg font-semibold mb-4">Design Coach</h2>
      
      <ScrollArea className="flex-1 pr-4">
        <div className="space-y-4">
          {messages.map((msg, i) => (
            msg.role === "error" ? (
              <Alert variant="destructive" key={i}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {msg.content}
                </AlertDescription>
              </Alert>
            ) : (
              <div
                key={i}
                className={`p-3 rounded-lg ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground ml-8"
                    : "bg-muted mr-8"
                }`}
              >
                {msg.content}
              </div>
            )
          ))}
        </div>
      </ScrollArea>

      <div className="mt-4 flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask for design advice..."
          className="min-h-[60px]"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />
        <Button 
          onClick={handleSubmit}
          disabled={isMutating}
          size="icon"
        >
          <MessageSquare className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
