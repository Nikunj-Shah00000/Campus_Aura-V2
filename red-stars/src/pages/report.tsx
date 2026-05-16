import { useState } from "react";
import { useReportMessage } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useLocation } from "wouter";

export function ReportPage() {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [messageId, setMessageId] = useState("");
  const [reportedAnonId, setReportedAnonId] = useState("");
  const [, setLocation] = useLocation();
  const reportMessage = useReportMessage();

  const handleReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason || !messageId || !reportedAnonId) {
      toast.error("Please fill in all required fields.");
      return;
    }

    reportMessage.mutate({
      messageId: parseInt(messageId),
      data: { reason, reportedAnonId, details }
    }, {
      onSuccess: (res) => {
        if (res.autoBanned) {
          toast.success("User was automatically banned based on reports.");
        } else {
          toast.success("Report submitted successfully.");
        }
        setTimeout(() => setLocation("/"), 2000);
      },
      onError: () => {
        toast.error("Failed to submit report. Please try again.");
      }
    });
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 w-full">
      <div className="glass-panel p-8 rounded-2xl w-full max-w-lg border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
        <div className="mb-8 text-center">
          <div className="w-12 h-12 bg-destructive/20 text-destructive rounded-full flex items-center justify-center mx-auto mb-4 border border-destructive/50 shadow-[0_0_15px_rgba(204,0,34,0.3)]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Report a Signal</h1>
          <p className="text-sm text-gray-400">Help keep the constellation safe. Reports are monitored in real-time.</p>
        </div>

        <form onSubmit={handleReport} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Message ID</label>
            <Input 
              type="number"
              required
              placeholder="e.g. 42"
              value={messageId}
              onChange={(e) => setMessageId(e.target.value)}
              className="bg-black/20 border-white/10 text-white h-11"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Offender Identity</label>
            <Input 
              type="text"
              required
              placeholder="e.g. Star #1234"
              value={reportedAnonId}
              onChange={(e) => setReportedAnonId(e.target.value)}
              className="bg-black/20 border-white/10 text-white h-11"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Violation Type</label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="bg-black/20 border-white/10 text-white h-11">
                <SelectValue placeholder="Select violation" />
              </SelectTrigger>
              <SelectContent className="bg-[#0c0c10] border-white/10 text-white">
                <SelectItem value="harassment">Harassment / Bullying</SelectItem>
                <SelectItem value="hate_speech">Hate Speech</SelectItem>
                <SelectItem value="nudity">Nudity / Sexual Content</SelectItem>
                <SelectItem value="drugs">Drugs / Contraband</SelectItem>
                <SelectItem value="spam">Spam / Automation</SelectItem>
                <SelectItem value="other">Other Protocol Violation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Additional Context</label>
            <Textarea 
              placeholder="Provide any helpful details..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="bg-black/20 border-white/10 text-white min-h-[100px] resize-none"
            />
          </div>

          <Button 
            type="submit"
            disabled={reportMessage.isPending}
            className="w-full h-12 mt-4 bg-destructive hover:bg-destructive/90 text-white tracking-wide rounded-xl"
          >
            {reportMessage.isPending ? "Transmitting..." : "Submit Report"}
          </Button>
        </form>
      </div>
    </div>
  );
}
