import { useState } from "react";
import { useListCounselors, useConnectCounselor } from "@workspace/api-client-react";
import { getIdentity } from "@/lib/identity";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { motion } from "framer-motion";

export function Counselors() {
  const { data: counselors, isLoading } = useListCounselors();
  const connectCounselor = useConnectCounselor();
  const identity = getIdentity();

  const [problemType, setProblemType] = useState("");
  const [urgency, setUrgency] = useState("");
  const [match, setMatch] = useState<any>(null);

  const handleConnect = () => {
    if (!problemType || !urgency) {
      toast.error("Please select a reason and urgency level.");
      return;
    }

    connectCounselor.mutate({
      data: {
        problemType,
        anonId: identity,
        urgency
      }
    }, {
      onSuccess: (data) => {
        setMatch(data);
      },
      onError: () => {
        toast.error("Failed to connect. Please try again.");
      }
    });
  };

  return (
    <div className="flex-1 flex flex-col p-6 max-w-5xl mx-auto w-full gap-8 overflow-y-auto">
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold text-white mb-4 tracking-wide">Professional Guidance</h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Sometimes the dark is too quiet. Connect with verified counselors specialized in navigating difficult emotional spaces.
        </p>
      </div>

      {!match ? (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="glass-panel p-8 rounded-2xl space-y-6">
            <h2 className="text-xl font-medium text-white mb-4">Request a Session</h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">What are you navigating?</label>
                <Select value={problemType} onValueChange={setProblemType}>
                  <SelectTrigger className="bg-black/20 border-white/10 text-white h-12">
                    <SelectValue placeholder="Select area of concern" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0c0c10] border-white/10 text-white">
                    <SelectItem value="anxiety">Anxiety & Panic</SelectItem>
                    <SelectItem value="depression">Depression</SelectItem>
                    <SelectItem value="loneliness">Isolation / Loneliness</SelectItem>
                    <SelectItem value="stress">Overwhelming Stress</SelectItem>
                    <SelectItem value="relationship">Relationship Issues</SelectItem>
                    <SelectItem value="bullying">Bullying / Harassment</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Current state</label>
                <Select value={urgency} onValueChange={setUrgency}>
                  <SelectTrigger className="bg-black/20 border-white/10 text-white h-12">
                    <SelectValue placeholder="Select urgency" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0c0c10] border-white/10 text-white">
                    <SelectItem value="low">Just need to talk</SelectItem>
                    <SelectItem value="medium">Feeling stuck</SelectItem>
                    <SelectItem value="high">Hurting badly</SelectItem>
                    <SelectItem value="crisis">In crisis</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleConnect} 
                disabled={connectCounselor.isPending}
                className="w-full h-12 mt-4 bg-primary hover:bg-primary/90 text-white text-lg tracking-wide rounded-xl shadow-[0_0_15px_rgba(204,0,34,0.3)] hover:shadow-[0_0_25px_rgba(204,0,34,0.5)] transition-all"
              >
                {connectCounselor.isPending ? "Locating counselor..." : "Connect me now"}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest pl-2">Available Guides</h2>
            <div className="grid gap-4 custom-scrollbar pr-2 max-h-[500px] overflow-y-auto">
              {isLoading ? (
                Array(3).fill(0).map((_, i) => <div key={i} className="h-32 bg-white/5 rounded-xl animate-pulse" />)
              ) : (
                counselors?.map(c => (
                  <div key={c.id} className="glass-panel p-5 rounded-xl flex gap-4 border border-white/5 hover:bg-white/5 transition-colors">
                    <div 
                      className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-xl font-bold bg-black/50 border border-white/10"
                      style={{ color: c.avatarColor, textShadow: `0 0 10px ${c.avatarColor}` }}
                    >
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-medium text-gray-200">{c.name}</h3>
                        <span className="text-xs font-mono text-gray-500 px-2 py-0.5 rounded bg-white/5">★ {c.rating}</span>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">{c.tagline}</p>
                      <div className="flex flex-wrap gap-2">
                        {c.specialization.map(spec => (
                          <span key={spec} className="text-[10px] uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto w-full glass-panel p-8 rounded-2xl border border-primary/30 shadow-[0_0_30px_rgba(204,0,34,0.15)] text-center"
        >
          <div className="w-20 h-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-6 relative">
            <div className="absolute inset-0 rounded-full border border-primary animate-ping" />
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold bg-black/50"
              style={{ color: match.counselor.avatarColor, textShadow: `0 0 15px ${match.counselor.avatarColor}` }}
            >
              {match.counselor.name.charAt(0)}
            </div>
          </div>
          
          <h2 className="text-2xl font-medium text-white mb-2">Match Found</h2>
          <p className="text-gray-300 mb-6">{match.counselor.name} is ready to connect with you.</p>
          
          <div className="bg-black/30 rounded-xl p-4 mb-8">
            <p className="text-sm text-gray-400 mb-1">Estimated Wait Time</p>
            <p className="text-3xl font-mono font-light text-primary">{match.estimatedWait} min</p>
          </div>

          <Button 
            className="w-full h-12 bg-white text-black hover:bg-gray-200 text-lg rounded-xl font-medium"
            onClick={() => toast.success("Session initiated. Waiting for counselor to join.")}
          >
            Start Session
          </Button>
          <button 
            onClick={() => setMatch(null)}
            className="mt-4 text-sm text-gray-500 hover:text-white transition-colors"
          >
            Cancel request
          </button>
        </motion.div>
      )}
    </div>
  );
}
