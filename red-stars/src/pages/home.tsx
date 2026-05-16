import { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { 
  useListRooms, 
  useListMessages, 
  useSendMessage, 
  useGetLiveStats, 
  useGetMoodPulse,
  getListMessagesQueryKey,
  useReportMessage
} from "@workspace/api-client-react";
import { getIdentity } from "@/lib/identity";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function Home() {
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [messageContent, setMessageContent] = useState("");
  const [isBanned, setIsBanned] = useState(false);
  const [banTime, setBanTime] = useState(300); // 5 minutes
  const identity = getIdentity();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: rooms, isLoading: loadingRooms } = useListRooms();
  const { data: messages, isLoading: loadingMessages } = useListMessages(selectedRoomId || 0, {
    query: {
      enabled: !!selectedRoomId,
      queryKey: getListMessagesQueryKey(selectedRoomId || 0)
    }
  });
  
  const sendMessage = useSendMessage();
  const { data: stats } = useGetLiveStats();
  const { data: moodPulse } = useGetMoodPulse();

  // Polling for messages
  useEffect(() => {
    if (!selectedRoomId) return;
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: getListMessagesQueryKey(selectedRoomId) });
    }, 3000);
    return () => clearInterval(interval);
  }, [selectedRoomId, queryClient]);

  // Polling for stats and mood
  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["/api/stats/live"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/mood"] });
    }, 10000);
    return () => clearInterval(interval);
  }, [queryClient]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Ban timer
  useEffect(() => {
    if (isBanned && banTime > 0) {
      const timer = setInterval(() => setBanTime(t => t - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [isBanned, banTime]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomId || !messageContent.trim() || isBanned) return;

    const content = messageContent;
    setMessageContent("");

    sendMessage.mutate({
      roomId: selectedRoomId,
      data: { content, anonId: identity }
    }, {
      onSuccess: (res) => {
        if (res.autoBanned) {
          setIsBanned(true);
          setBanTime(300);
        } else if (res.wasFiltered) {
          toast.error(`Message blocked: ${res.filterReason}`);
        } else {
          queryClient.invalidateQueries({ queryKey: getListMessagesQueryKey(selectedRoomId) });
        }
      },
      onError: () => {
        toast.error("Failed to send message. The void is silent.");
      }
    });
  };

  const selectedRoom = rooms?.find(r => r.id === selectedRoomId);

  if (isBanned) {
    return (
      <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-6 text-center backdrop-blur-3xl">
        <h1 className="text-4xl font-bold text-destructive mb-4 tracking-widest uppercase">Connection Severed</h1>
        <p className="text-xl text-gray-300 mb-8 max-w-lg">
          You have been temporarily suspended for violating community guidelines.
        </p>
        <div className="text-6xl font-mono text-primary/80 animate-pulse">
          {Math.floor(banTime / 60)}:{(banTime % 60).toString().padStart(2, '0')}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex overflow-hidden p-6 gap-6 h-[calc(100vh-73px)]">
      {/* Left Panel: Rooms */}
      <div className="w-80 flex flex-col gap-4">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-2">Constellations</h2>
        <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
          {loadingRooms ? (
            Array(5).fill(0).map((_, i) => <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />)
          ) : (
            rooms?.map(room => (
              <button
                key={room.id}
                onClick={() => setSelectedRoomId(room.id)}
                className={`w-full text-left p-4 rounded-xl transition-all duration-300 glass-panel hover:bg-white/10 ${selectedRoomId === room.id ? 'ring-1 ring-primary bg-white/10' : ''}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-200">{room.name}</h3>
                  <span className="text-xs font-mono text-gray-500">{room.activeUsers} online</span>
                </div>
                <p className="text-xs text-gray-400 line-clamp-1">{room.topic}</p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Center Panel: Chat */}
      <div className="flex-1 flex flex-col glass-panel rounded-2xl overflow-hidden relative">
        {selectedRoom ? (
          <>
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/20">
              <div>
                <h2 className="text-lg font-bold text-gray-200">{selectedRoom.name}</h2>
                <p className="text-sm text-gray-400">{selectedRoom.topic}</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                <div className={`w-2 h-2 rounded-full ${selectedRoom.mood === 'crisis' ? 'bg-destructive shadow-[0_0_8px_rgba(204,0,34,0.8)]' : 'bg-primary/50'}`} />
                <span className="text-xs text-gray-300 capitalize">{selectedRoom.mood}</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {loadingMessages ? (
                 <div className="flex flex-col gap-4 opacity-50">
                    <div className="h-16 w-3/4 bg-white/5 rounded-2xl animate-pulse" />
                    <div className="h-16 w-2/3 bg-white/5 rounded-2xl animate-pulse ml-auto" />
                 </div>
              ) : (
                <AnimatePresence initial={false}>
                  {messages?.map((msg) => {
                    const isMine = msg.anonId === identity;
                    const isBlocked = msg.isBlocked || msg.isFlagged;
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} max-w-[80%] ${isMine ? 'ml-auto' : ''}`}
                      >
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-xs font-mono text-gray-500">{msg.anonId}</span>
                          <span className="text-[10px] text-gray-600">{new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          {!isMine && !isBlocked && <ReportMessageDialog messageId={msg.id} reportedAnonId={msg.anonId} />}
                        </div>
                        <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                          isBlocked 
                            ? 'bg-destructive/10 text-destructive/80 border border-destructive/20 italic' 
                            : isMine 
                              ? 'bg-primary/20 text-white border border-primary/30 rounded-tr-sm' 
                              : 'bg-white/5 text-gray-200 border border-white/10 rounded-tl-sm'
                        }`}>
                          {isBlocked ? "[Message removed by moderation]" : msg.content}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5 bg-black/20 flex gap-4">
              <input 
                type="text"
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="Speak into the void..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
              />
              <Button type="submit" disabled={!messageContent.trim()} className="bg-primary hover:bg-primary/90 text-white px-8 rounded-xl font-medium tracking-wide">
                Send
              </Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <div className="w-16 h-16 rounded-full border border-gray-800 flex items-center justify-center mb-4">
              <div className="w-2 h-2 rounded-full bg-gray-700" />
            </div>
            <p>Select a constellation to connect.</p>
          </div>
        )}
      </div>

      {/* Right Panel: Stats & Mood */}
      <div className="w-80 flex flex-col gap-6">
        <div className="glass-panel p-6 rounded-2xl">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">Atmosphere Pulse</h2>
          
          <div className="mb-6">
            <div className="flex justify-between items-end mb-2">
              <span className="text-sm text-gray-300">Crisis Probability</span>
              <span className="text-xl font-mono font-light text-primary">{moodPulse?.crisisLevel || 0}%</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-destructive transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(204,0,34,0.5)]"
                style={{ width: `${moodPulse?.crisisLevel || 0}%` }}
              />
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-xs text-gray-500">Emotional Breakdown</span>
            <div className="flex flex-wrap gap-2">
              {moodPulse?.breakdown && Object.entries(moodPulse.breakdown).map(([mood, val]) => (
                <div key={mood} className="px-2 py-1 bg-white/5 rounded text-[10px] text-gray-400 capitalize border border-white/5">
                  {mood}: {val}%
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex-1">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">Network Health</h2>
          <div className="space-y-4">
            <StatRow label="Messages Today" value={stats?.messagesToday} />
            <StatRow label="Rooms Online" value={stats?.roomsOnline} />
            <StatRow label="Reports Banned" value={stats?.reportsBanned} />
            <StatRow label="Counselor Sessions" value={stats?.counselorSessions} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value }: { label: string, value?: number }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-white/5">
      <span className="text-sm text-gray-400">{label}</span>
      <span className="font-mono text-gray-200">{value || 0}</span>
    </div>
  );
}

function ReportMessageDialog({ messageId, reportedAnonId }: { messageId: number, reportedAnonId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const reportMessage = useReportMessage();

  const handleReport = () => {
    if (!reason) return;
    reportMessage.mutate({
      messageId,
      data: { reason, reportedAnonId, details }
    }, {
      onSuccess: (res) => {
        setOpen(false);
        if (res.autoBanned) {
          toast.success("User was automatically banned based on reports.");
        } else {
          toast.success("Report submitted. We are monitoring the situation.");
        }
      },
      onError: () => {
        toast.error("Failed to submit report.");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="text-gray-600 hover:text-destructive transition-colors text-[10px] px-2 py-0.5 rounded border border-transparent hover:border-destructive/30">
          Report
        </button>
      </DialogTrigger>
      <DialogContent className="glass-panel border-white/10 text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Report Signal</DialogTitle>
          <DialogDescription className="text-gray-400">
            If this message violates safety protocols, report it immediately.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="bg-black/20 border-white/10 text-white">
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent className="bg-[#0c0c10] border-white/10 text-white">
                <SelectItem value="harassment">Harassment</SelectItem>
                <SelectItem value="nudity">Nudity / Sexual Content</SelectItem>
                <SelectItem value="hate_speech">Hate Speech</SelectItem>
                <SelectItem value="drugs">Drugs / Contraband</SelectItem>
                <SelectItem value="spam">Spam / Bots</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Textarea 
              placeholder="Additional details (optional)" 
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="bg-black/20 border-white/10 text-white placeholder:text-gray-500"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} className="text-gray-400 hover:text-white">Cancel</Button>
          <Button onClick={handleReport} disabled={!reason} className="bg-destructive hover:bg-destructive/90 text-white">
            Submit Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
