import { motion } from "framer-motion";
import {
  MessageCircle,
  Plane,
  Building2,
  Zap,
  Brain,
  Shield,
  Star,
} from "lucide-react";

const HeroSection = ({ onStartChat }: { onStartChat: () => void }) => {
  return (
    <section className="min-h-screen bg-gradient-to-br from-[hsl(142,60%,18%)] via-[hsl(142,50%,22%)] to-[hsl(160,50%,16%)] flex flex-col">
      {/* WhatsApp-style Status Bar area */}
      <div className="pt-8 px-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-bold text-[15px]">TravelGenie</span>
        </div>
        <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1">
          <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          <span className="text-white/80 text-[11px] font-medium">AI Online</span>
        </div>
      </div>

      {/* Main hero body */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-lg"
        >
          {/* WhatsApp Chat Preview mockup */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="bg-[hsl(190,20%,87%)] rounded-2xl shadow-2xl p-3 mb-8 mx-auto max-w-[320px]"
          >
            {/* Mock chat header */}
            <div className="bg-[hsl(142,60%,22%)] rounded-xl p-2.5 flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-300 to-teal-500 flex items-center justify-center text-white font-bold text-[10px]">TG</div>
              <div>
                <p className="text-white text-[12px] font-semibold leading-none">TravelGenie AI</p>
                <p className="text-green-300 text-[9px]">online • powered by ChatGPT + Bedrock</p>
              </div>
            </div>

            {/* Mock messages */}
            <div className="space-y-2 px-1">
              <div className="flex justify-start">
                <div className="bg-white rounded-lg rounded-bl-none px-3 py-2 shadow-sm max-w-[80%]">
                  <p className="text-[11px] text-gray-700">NYC to Dubai, March 15-22, $800 budget ✈️</p>
                  <p className="text-[9px] text-gray-400 mt-0.5 text-right">10:32 AM</p>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-[hsl(142,53%,40%)] rounded-lg rounded-br-none px-3 py-2 shadow-sm max-w-[80%]">
                  <p className="text-[11px] text-white">🤖 Searching 3 AI agents...</p>
                  <p className="text-[9px] text-white/60 mt-0.5 text-right">10:32 AM ✓✓</p>
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-white rounded-lg rounded-bl-none px-3 py-2 shadow-sm max-w-[85%]">
                  <p className="text-[11px] text-gray-700">✅ Found best deal: Emirates $720 + Atlantis $280/nt</p>
                  <p className="text-[9px] text-gray-400 mt-0.5 text-right">10:33 AM</p>
                </div>
              </div>
            </div>
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            Your AI Travel Agent
            <br />
            <span className="text-green-300">in WhatsApp Style</span>
          </h1>

          <p className="text-white/70 text-[15px] leading-relaxed mb-8 max-w-md mx-auto">
            Powered by <span className="text-white font-semibold">ChatGPT</span> for intelligent search and{" "}
            <span className="text-white font-semibold">AWS Bedrock AI</span> for optimization. Just chat naturally!
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {[
              { icon: Brain, label: "ChatGPT Search", color: "bg-purple-500" },
              { icon: Zap, label: "Bedrock AI Optimizer", color: "bg-blue-500" },
              { icon: Plane, label: "Live Flights", color: "bg-sky-500" },
              { icon: Building2, label: "Hotel Finder", color: "bg-orange-500" },
              { icon: Shield, label: "Secure Booking", color: "bg-emerald-600" },
              { icon: Star, label: "Best Deals", color: "bg-yellow-500" },
            ].map(({ icon: Icon, label, color }) => (
              <div
                key={label}
                className={`${color} text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[11px] font-semibold shadow-md`}
              >
                <Icon className="w-3 h-3" />
                {label}
              </div>
            ))}
          </div>

          {/* CTA Button - WhatsApp style */}
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
            whileTap={{ scale: 0.97 }}
            onClick={onStartChat}
            className="bg-[hsl(142,53%,40%)] hover:bg-[hsl(142,53%,36%)] text-white font-bold text-[15px] px-8 py-4 rounded-full shadow-xl flex items-center gap-3 mx-auto transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            Start Chat with TravelGenie
          </motion.button>

          <p className="text-white/40 text-[11px] mt-4">
            Free to try • No signup required • Real AI
          </p>
        </motion.div>
      </div>


    </section>
  );
};

export default HeroSection;
