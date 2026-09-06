import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquareCode, QrCode, Smartphone, CheckCircle } from "lucide-react";

export default function WhatsAppBotCard() {
  return (
    <Card className="border-neutral-900 bg-neutral-950/40 backdrop-blur-sm shadow-xl h-full flex flex-col justify-between">
      <div>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-white uppercase tracking-wider flex items-center">
              <MessageSquareCode className="h-4 w-4 mr-2 text-green-400" />
              WhatsApp DO Parser Bot
            </CardTitle>
            <span className="flex items-center text-[10px] bg-emerald-950/40 text-emerald-400 border border-emerald-900/60 font-semibold px-2 py-0.5 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
              Online
            </span>
          </div>
          <CardDescription className="text-neutral-500 text-xs">
            Forward Delivery Orders or Invoices directly to our automated WhatsApp line.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 text-xs">
          {/* STEP BY STEP */}
          <div className="space-y-3">
            <div className="flex items-start space-x-3 text-neutral-300">
              <div className="h-5 w-5 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-[10px] font-bold text-neutral-400 shrink-0">
                1
              </div>
              <p className="leading-tight">
                Scan the QR code or add our business profile contact number: <strong className="text-white">+91 99999 99999</strong>.
              </p>
            </div>
            
            <div className="flex items-start space-x-3 text-neutral-300">
              <div className="h-5 w-5 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-[10px] font-bold text-neutral-400 shrink-0">
                2
              </div>
              <p className="leading-tight">
                Forward your standard container PDF files (DO/Invoices) to the chat.
              </p>
            </div>

            <div className="flex items-start space-x-3 text-neutral-300">
              <div className="h-5 w-5 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-[10px] font-bold text-neutral-400 shrink-0">
                3
              </div>
              <p className="leading-tight">
                Our automated engine processes the PDF, returns confirmation details, and auto-adds records to your list.
              </p>
            </div>
          </div>

          {/* QR CODE SKELETON */}
          <div className="flex flex-col items-center justify-center border border-neutral-900 bg-neutral-900/30 p-4 rounded-xl space-y-2">
            <div className="relative p-2 bg-white rounded-lg shadow-inner">
              <QrCode className="h-32 w-32 text-neutral-900" />
              <div className="absolute inset-0 flex items-center justify-center bg-white/95 rounded-lg opacity-0 hover:opacity-100 transition-opacity">
                <CheckCircle className="h-8 w-8 text-emerald-500" />
              </div>
            </div>
            <span className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wider flex items-center">
              Scan QR to Sync
            </span>
          </div>
        </CardContent>
      </div>

      <div className="px-6 py-4 border-t border-neutral-900/65 bg-neutral-900/10 rounded-b-xl text-[10px] text-neutral-500">
        WhatsApp integrations bypass standard dashboard uploads.
      </div>
    </Card>
  );
}
