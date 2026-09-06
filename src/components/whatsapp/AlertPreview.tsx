import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, CheckCheck, ShieldCheck } from "lucide-react";

interface AlertPreviewProps {
  messageText?: string;
  recipientName?: string;
}

export default function AlertPreview({
  messageText = "🔔 *DND Reminder* 🔔\n\nContainer *MSKU8976543* (Maersk) free period is ending soon.\nLast Free Day: *2026-09-02*.\nDays remaining: *3 day(s)*.\n\nPlan transport return schedules accordingly.",
  recipientName = "Driver (Rajesh Kumar)",
}: AlertPreviewProps) {
  
  // Parse simple markdown asterisks to JSX tags for visual styling
  const renderMessageContent = (text: string) => {
    return text.split("\n").map((line, idx) => {
      // Bold matches
      let segments: React.ReactNode[] = [];
      const parts = line.split(/\*(.*?)\*/g);
      
      parts.forEach((part, i) => {
        if (i % 2 === 1) {
          segments.push(<strong key={i} className="font-extrabold text-white">{part}</strong>);
        } else {
          segments.push(<span key={i}>{part}</span>);
        }
      });

      return (
        <p key={idx} className="min-h-[1.2em]">
          {segments}
        </p>
      );
    });
  };

  return (
    <Card className="border-neutral-900 bg-neutral-950/40 backdrop-blur-sm shadow-xl overflow-hidden">
      <CardHeader className="pb-3 bg-neutral-900/40 border-b border-neutral-900">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-emerald-600/20 flex items-center justify-center text-emerald-400">
            <MessageSquare className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-xs font-bold text-white leading-none">{recipientName}</CardTitle>
            <span className="text-[9px] text-neutral-500 font-medium">WhatsApp Notification Sync</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat bg-neutral-950/80">
        <div className="flex flex-col space-y-4 min-h-[180px] justify-end">
          {/* WHATSAPP BUBBLE */}
          <div className="self-end max-w-[85%] bg-emerald-950 border border-emerald-900 text-neutral-200 text-xs px-3 py-2 rounded-xl rounded-tr-none shadow-md space-y-1 relative">
            <div className="space-y-1 break-words font-sans text-neutral-300">
              {renderMessageContent(messageText)}
            </div>
            
            {/* META INFO */}
            <div className="flex items-center justify-end space-x-1 text-[9px] text-emerald-500/80 mt-1">
              <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <CheckCheck className="h-3.5 w-3.5 text-emerald-400" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
