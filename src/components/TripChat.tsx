import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  MoreVertical,
  Phone,
  Video,
  Plane,
  Building2,
  Brain,
  BarChart3,
  CreditCard,
  Star,
  Clock,
  MapPin,
  Sparkles,
  Wifi,
  CheckCheck,
  Shield,
  Zap,
} from "lucide-react";
import ChatMessage, { Message } from "./ChatMessage";
import ChatInput from "./ChatInput";
import BookingConfirmation from "./BookingConfirmation";
import {
  orchestrateTravelSearch,
  simulateBooking,
  TravelPlan,
  FlightResult,
  HotelResult,
} from "@/lib/travelAI";

// ─── Constants ─────────────────────────────────────────────────────────────────

// Pause duration (ms) between showing results and starting auto-booking
const AUTO_BOOK_DELAY = 3500;

// ─── Typing Indicator ──────────────────────────────────────────────────────────

const TypingIndicator = () => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 4 }}
    className="flex justify-start px-3 mb-1"
  >
    <div className="bg-white dark:bg-[hsl(195,14%,22%)] rounded-xl rounded-bl-none px-4 py-3 shadow-sm">
      <div className="flex gap-1.5 items-center">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-gray-400"
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.18, ease: "easeInOut" }}
          />
        ))}
      </div>
    </div>
  </motion.div>
);

// ─── Countdown Toast ───────────────────────────────────────────────────────────

const AutoBookCountdown = ({ seconds }: { seconds: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9, y: 10 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className="flex justify-center px-3 mb-2"
  >
    <div className="bg-[hsl(142,53%,40%)] text-white rounded-full px-4 py-2 text-[12px] font-bold shadow-lg flex items-center gap-2">
      <Zap className="w-3.5 h-3.5 animate-pulse" />
      Auto-booking cheapest option in {seconds}s...
    </div>
  </motion.div>
);

// ─── Agent Pipeline ────────────────────────────────────────────────────────────

type AgentId = "planner" | "flight" | "hotel" | "optimization" | "booking";

const AGENTS: { id: AgentId; label: string; icon: React.ElementType; color: string }[] = [
  { id: "planner", label: "Planner", icon: Brain, color: "#8B5CF6" },
  { id: "flight", label: "Flights", icon: Plane, color: "#0EA5E9" },
  { id: "hotel", label: "Hotels", icon: Building2, color: "#F97316" },
  { id: "optimization", label: "Bedrock AI", icon: BarChart3, color: "#10B981" },
  { id: "booking", label: "Booking", icon: CreditCard, color: "#F59E0B" },
];

const AgentPipeline = ({
  activeAgent,
  completedAgents,
  currentStep,
}: {
  activeAgent: AgentId | null;
  completedAgents: AgentId[];
  currentStep: string;
}) => (
  <motion.div
    initial={{ height: 0, opacity: 0 }}
    animate={{ height: "auto", opacity: 1 }}
    exit={{ height: 0, opacity: 0 }}
    className="overflow-hidden bg-white/90 dark:bg-gray-900/90 border-b border-gray-200 dark:border-gray-700"
  >
    <div className="px-3 py-2.5">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
        <Sparkles className="w-3 h-3 text-[hsl(142,53%,40%)]" /> AI Agents Working
      </p>
      <div className="flex gap-1.5 flex-wrap mb-1.5">
        {AGENTS.map((a) => {
          const isActive = activeAgent === a.id;
          const isDone = completedAgents.includes(a.id);
          const Icon = a.icon;
          return (
            <motion.div
              key={a.id}
              animate={{ scale: isActive ? 1.08 : 1 }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors ${isDone
                  ? "bg-[hsl(142,53%,40%)] text-white"
                  : isActive
                    ? "text-white shadow-lg"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                }`}
              style={isActive ? { backgroundColor: a.color } : undefined}
            >
              {isActive ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                >
                  <Icon className="w-3 h-3" />
                </motion.div>
              ) : (
                <Icon className="w-3 h-3" />
              )}
              {a.label}
            </motion.div>
          );
        })}
      </div>
      {currentStep && (
        <motion.p
          key={currentStep}
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-[11px] text-gray-500 font-mono truncate"
        >
          {currentStep}
        </motion.p>
      )}
    </div>
  </motion.div>
);

// ─── Date Separator ────────────────────────────────────────────────────────────

const DateSeparator = ({ label }: { label: string }) => (
  <div className="flex justify-center my-2">
    <span className="bg-white/70 dark:bg-gray-700/60 text-gray-500 dark:text-gray-400 text-[11px] px-3 py-0.5 rounded-full shadow-sm">
      {label}
    </span>
  </div>
);

// ─── Flight Card ───────────────────────────────────────────────────────────────

const FlightCard = ({
  flight,
  recommended,
}: {
  flight: FlightResult;
  recommended: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, x: -16 }}
    animate={{ opacity: 1, x: 0 }}
    className={`bg-white dark:bg-[hsl(195,14%,22%)] rounded-2xl shadow-sm overflow-hidden border-l-[3px] ${recommended ? "border-[hsl(142,53%,40%)]" : "border-gray-100 dark:border-gray-700"
      }`}
  >
    {recommended && (
      <div className="bg-[hsl(142,53%,40%)] text-white text-[10px] font-bold px-3 py-1 flex items-center gap-1.5">
        <Zap className="w-3 h-3" /> BEDROCK AI · CHEAPEST PICK · AUTO-BOOKING
      </div>
    )}
    <div className="p-3">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
            <Plane className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <p className="text-[13px] font-bold text-gray-800 dark:text-gray-100 leading-none">{flight.airline}</p>
            {flight.aircraft && <p className="text-[10px] text-gray-400 mt-0.5">{flight.aircraft}</p>}
          </div>
        </div>
        <div className="text-right">
          <p className="text-[18px] font-extrabold text-[hsl(142,53%,35%)]">${flight.price}</p>
          <p className="text-[9px] text-gray-400">per person</p>
        </div>
      </div>
      <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl px-3 py-2">
        <div className="text-center">
          <p className="text-[16px] font-black text-gray-800 dark:text-gray-100 leading-none">{flight.departureTime}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">{flight.departure}</p>
        </div>
        <div className="flex-1 flex items-center gap-1.5">
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-600" />
          <div className="text-center">
            <Clock className="w-3 h-3 text-gray-400 mx-auto" />
            <p className="text-[9px] text-gray-400 whitespace-nowrap">{flight.duration}</p>
            <p className={`text-[9px] font-semibold ${flight.stops === 0 ? "text-green-500" : "text-orange-400"}`}>
              {flight.stops === 0 ? "Direct" : `${flight.stops} stop`}
            </p>
          </div>
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-600" />
        </div>
        <div className="text-center">
          <p className="text-[16px] font-black text-gray-800 dark:text-gray-100 leading-none">{flight.arrivalTime}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">{flight.arrival}</p>
        </div>
      </div>
      {flight.co2 && <p className="text-[9px] text-gray-400 mt-1.5 text-right">🌱 {flight.co2}</p>}
    </div>
  </motion.div>
);

// ─── Hotel Card ────────────────────────────────────────────────────────────────

const HotelCard = ({
  hotel,
  recommended,
}: {
  hotel: HotelResult;
  recommended: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, x: -16 }}
    animate={{ opacity: 1, x: 0 }}
    className={`bg-white dark:bg-[hsl(195,14%,22%)] rounded-2xl shadow-sm overflow-hidden border-l-[3px] ${recommended ? "border-[hsl(142,53%,40%)]" : "border-gray-100 dark:border-gray-700"
      }`}
  >
    {recommended && (
      <div className="bg-[hsl(142,53%,40%)] text-white text-[10px] font-bold px-3 py-1 flex items-center gap-1.5">
        <Zap className="w-3 h-3" /> BEDROCK AI · CHEAPEST PICK · AUTO-BOOKING
      </div>
    )}
    <div className="p-3">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 pr-2">
          <p className="text-[13px] font-bold text-gray-800 dark:text-gray-100 leading-tight">{hotel.name}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-gray-400" />
            <p className="text-[10px] text-gray-400">{hotel.location}</p>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-[18px] font-extrabold text-[hsl(142,53%,35%)]">${hotel.pricePerNight}</p>
          <p className="text-[9px] text-gray-400">per night</p>
        </div>
      </div>
      <div className="flex items-center gap-1 mb-2">
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-3 h-3 ${i < Math.floor(hotel.rating) ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}`}
            />
          ))}
        </div>
        <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-300 ml-1">{hotel.rating}</span>
        {hotel.reviewCount && (
          <span className="text-[10px] text-gray-400">({hotel.reviewCount.toLocaleString()} reviews)</span>
        )}
      </div>
      <div className="flex flex-wrap gap-1">
        {hotel.amenities.slice(0, 5).map((a) => (
          <span key={a} className="text-[9px] bg-gray-100 dark:bg-gray-700/60 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">
            {a}
          </span>
        ))}
      </div>
      {hotel.distanceFromCenter && (
        <p className="text-[9px] text-gray-400 mt-1.5">📍 {hotel.distanceFromCenter}</p>
      )}
    </div>
  </motion.div>
);

// ─── Bedrock Live Card ─────────────────────────────────────────────────────────

const BedrockLiveCard = ({ steps }: { steps: string[] }) => (
  <motion.div
    initial={{ opacity: 0, x: -16 }}
    animate={{ opacity: 1, x: 0 }}
    className="flex justify-start px-3 mb-2"
  >
    <div className="max-w-[88%] bg-white dark:bg-[hsl(195,14%,22%)] rounded-2xl rounded-bl-none shadow-sm p-3 border border-emerald-100 dark:border-emerald-900/30">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
          <Shield className="w-3 h-3 text-white" />
        </div>
        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
          AWS Bedrock · Claude 3 Sonnet · Picking cheapest...
        </span>
      </div>
      <div className="space-y-0.5">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.04 * i }}
            className="flex items-start gap-1.5 text-[11px] text-gray-600 dark:text-gray-300"
          >
            <CheckCheck className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" />
            <span className="font-mono leading-snug">{step}</span>
          </motion.div>
        ))}
      </div>
      <motion.div
        animate={{ scaleX: [0, 1] }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="h-0.5 bg-emerald-300 rounded-full mt-2 origin-left"
      />
    </div>
  </motion.div>
);

// ─── Booking Live Card ─────────────────────────────────────────────────────────

const BookingLiveCard = ({ steps }: { steps: string[] }) => (
  <motion.div
    initial={{ opacity: 0, x: -16 }}
    animate={{ opacity: 1, x: 0 }}
    className="flex justify-start px-3 mb-2"
  >
    <div className="max-w-[88%] bg-white dark:bg-[hsl(195,14%,22%)] rounded-2xl rounded-bl-none shadow-sm p-3 border border-amber-100 dark:border-amber-900/30">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
          <CreditCard className="w-3 h-3 text-white" />
        </div>
        <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
          Booking Agent · Processing transaction...
        </span>
      </div>
      <div className="space-y-0.5">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.04 * i }}
            className="flex items-start gap-1.5 text-[11px] text-gray-600 dark:text-gray-300"
          >
            <CheckCheck className="w-3 h-3 text-amber-400 mt-0.5 flex-shrink-0" />
            <span className="font-mono leading-snug">{step}</span>
          </motion.div>
        ))}
      </div>
      <motion.div
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ repeat: Infinity, duration: 1 }}
        className="h-0.5 bg-amber-300 rounded-full mt-2"
      />
    </div>
  </motion.div>
);

// ─── Main TripChat ─────────────────────────────────────────────────────────────

interface TripChatProps {
  onBack: () => void;
}

export default function TripChat({ onBack }: TripChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "✈️ Hey! I'm *TravelGenie* — your fully autonomous AI travel agent!\n\nHow it works:\n1️⃣ You tell me where & when\n2️⃣ *ChatGPT* searches real flights & hotels\n3️⃣ *AWS Bedrock AI* picks the cheapest best-value combo\n4️⃣ I *auto-book it for you* — no confirmation needed!\n\n*Example:* \"NYC to Dubai, March 15-22, $800 flight budget, $200/night hotel\"\n\nJust chat naturally and I'll handle everything! 🚀",
      timestamp: new Date(),
      status: "read",
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [activeAgent, setActiveAgent] = useState<AgentId | null>(null);
  const [completedAgents, setCompletedAgents] = useState<AgentId[]>([]);
  const [currentStep, setCurrentStep] = useState("");
  const [flights, setFlights] = useState<FlightResult[]>([]);
  const [hotels, setHotels] = useState<HotelResult[]>([]);
  const [bedrockSteps, setBedrockSteps] = useState<string[]>([]);
  const [bookingSteps, setBookingSteps] = useState<string[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [plan, setPlan] = useState<TravelPlan | null>(null);
  const [showBooking, setShowBooking] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, flights, hotels, bedrockSteps, bookingSteps, isLoading, countdown]);

  // Cleanup on unmount
  useEffect(() => () => { if (countdownRef.current) clearInterval(countdownRef.current); }, []);

  const addMsg = (content: string, role: "assistant" | "user" = "assistant") => {
    const id = Date.now().toString() + Math.random();
    setMessages((prev) => [
      ...prev,
      { id, role, content, timestamp: new Date(), status: role === "user" ? "sent" : undefined },
    ]);
    if (role === "user") {
      setTimeout(() => {
        setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status: "read" as const } : m)));
      }, 1000);
    }
  };

  const reset = () => {
    setFlights([]);
    setHotels([]);
    setBedrockSteps([]);
    setBookingSteps([]);
    setCompletedAgents([]);
    setActiveAgent(null);
    setCurrentStep("");
    setCountdown(null);
    setPlan(null);
    if (countdownRef.current) clearInterval(countdownRef.current);
  };

  // ── Auto-book countdown then fire booking ──────────────────────────────────

  const startAutoBook = (readyPlan: TravelPlan) => {
    const totalSecs = Math.round(AUTO_BOOK_DELAY / 1000);
    setCountdown(totalSecs);

    let remaining = totalSecs;
    countdownRef.current = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        clearInterval(countdownRef.current!);
        setCountdown(null);
        runBooking(readyPlan);
      } else {
        setCountdown(remaining);
      }
    }, 1000);
  };

  // ── Booking simulation ─────────────────────────────────────────────────────

  const runBooking = async (readyPlan: TravelPlan) => {
    setIsLoading(true);
    setActiveAgent("booking");
    setBookingSteps([]);

    addMsg(
      `⚡ *Bedrock AI selected the cheapest combo!*\n\n✈️ *${readyPlan.bestFlight.airline}* — $${readyPlan.bestFlight.price}\n🏨 *${readyPlan.bestHotel.name}* — $${readyPlan.bestHotel.pricePerNight}/night\n💰 *Total: $${readyPlan.totalCost.toLocaleString()}*${readyPlan.savingsVsAlternative > 0 ? `\n💸 Saves you $${readyPlan.savingsVsAlternative} vs priciest options!` : ""}\n\n🤖 Booking agent is processing now...`
    );

    try {
      await simulateBooking(readyPlan, (step) => {
        setCurrentStep(step.label);
        setBookingSteps((prev) => [...prev, `${step.label} — ${step.detail}`]);
      });

      setCompletedAgents((prev) => [...prev, "booking"]);
      setActiveAgent(null);
      setCurrentStep("");

      addMsg(
        `🎉 *Trip Booked Successfully!*\n\n✅ Everything is confirmed!\n\n✈️ *${readyPlan.bestFlight.airline}* · ${readyPlan.bestFlight.departure} → ${readyPlan.bestFlight.arrival}\n   Departs ${readyPlan.bestFlight.departureTime} · Arrives ${readyPlan.bestFlight.arrivalTime}\n   ${readyPlan.bestFlight.stops === 0 ? "✅ Non-stop" : `🔄 ${readyPlan.bestFlight.stops} stop`}\n\n🏨 *${readyPlan.bestHotel.name}*\n   ${readyPlan.bestHotel.location} · ${readyPlan.parsedRequest.nights} nights\n\n💳 Charged: *$${readyPlan.totalCost.toLocaleString()}*\n📋 Ref: *${readyPlan.bookingRef}*\n\n📧 Confirmation emailed! Have an amazing trip! 🌍✨`
      );

      setIsBooked(true);
      setBookingSteps([]);

      // Show modal after message renders
      setTimeout(() => setShowBooking(true), 800);
    } catch (err) {
      console.error(err);
      addMsg("❌ Booking simulation failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Main search + auto-book flow ───────────────────────────────────────────

  const handleSearch = async (text: string) => {
    reset();
    setIsBooked(false);
    setIsLoading(true);

    try {
      const result = await orchestrateTravelSearch(text, (agentId, status, message) => {
        if (status === "active") {
          setActiveAgent(agentId as AgentId);
          if (message) setCurrentStep(message);
        } else if (status === "step") {
          if (message) {
            setCurrentStep(message);
            setBedrockSteps((prev) => [...prev, message]);
          }
        } else if (status === "done") {
          setCompletedAgents((prev) =>
            prev.includes(agentId as AgentId) ? prev : [...prev, agentId as AgentId]
          );
          setCurrentStep("");
        }
      });

      setPlan(result);
      setActiveAgent(null);
      setCurrentStep("");

      // Show flight cards
      setFlights(result.flights);
      addMsg(
        `✈️ *ChatGPT found ${result.flights.length} flights* for *${result.parsedRequest.origin} → ${result.parsedRequest.destination}*\n(${result.parsedRequest.departureDate} · ${result.parsedRequest.nights} nights):`
      );

      await delay(400);

      // Show hotel cards
      setHotels(result.hotels);
      addMsg(`🏨 *ChatGPT found ${result.hotels.length} hotels* in *${result.parsedRequest.destination}*:`);

      await delay(500);

      // Bedrock decision message
      addMsg(
        `🤖 *AWS Bedrock AI Analysis Complete!*\n\n${result.reasoning}\n\n📌 *Travel Tips:*\n${result.tips.map((t) => `• ${t}`).join("\n")}\n\n⚡ Auto-booking the cheapest combo in 3 seconds...`
      );

      // Start countdown → auto-book
      startAutoBook(result);
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Unknown error";
      const isKeyError = msg.includes("401") || msg.includes("API key") || msg.includes("Incorrect") || msg.includes("key");
      addMsg(
        `❌ *Error:* ${isKeyError
          ? "Invalid or missing OpenAI API key.\n\n🔑 Add your key to the `.env` file:\n`VITE_OPENAI_API_KEY=sk-your-key`\n\nThen restart the dev server."
          : "Something went wrong. Try a clearer travel request like: \"NYC to Paris, April 1-10, $900 budget\""
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (text: string) => {
    addMsg(text, "user");

    if (isBooked) {
      // After booking, treat new messages as new searches
      addMsg("Starting a new search for you! 🔍");
    }

    await handleSearch(text);
  };

  const showAgentBar = isLoading || completedAgents.length > 0;

  return (
    <div className="flex flex-col h-screen" style={{ background: "hsl(190,20%,87%)" }}>

      {/* ── WhatsApp Header ── */}
      <div className="text-white flex-shrink-0" style={{ background: "hsl(142,60%,22%)" }}>
        <div className="flex items-center gap-3 px-3 py-2.5">
          <button
            onClick={onBack}
            className="p-1.5 rounded-full hover:bg-white/10 transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="relative flex-shrink-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-300 to-teal-600 flex items-center justify-center text-white font-black text-sm shadow">
              TG
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-[hsl(142,60%,22%)]" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-bold text-[14px] leading-tight">TravelGenie AI</p>
            <p className="text-[11px] text-green-200 flex items-center gap-1.5 truncate">
              <Wifi className="w-3 h-3 flex-shrink-0" />
              {isLoading
                ? <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 1.2 }}>
                  {activeAgent === "booking" ? "booking your trip..." : "searching flights & hotels..."}
                </motion.span>
                : countdown !== null
                  ? <motion.span animate={{ opacity: [1, 0.6, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}>
                    auto-booking in {countdown}s...
                  </motion.span>
                  : "online · ChatGPT + AWS Bedrock · Autonomous"
              }
            </p>
          </div>

          <div className="flex gap-0.5">
            <button className="p-2 rounded-full hover:bg-white/10 transition-colors"><Video className="w-5 h-5" /></button>
            <button className="p-2 rounded-full hover:bg-white/10 transition-colors"><Phone className="w-5 h-5" /></button>
            <button className="p-2 rounded-full hover:bg-white/10 transition-colors"><MoreVertical className="w-5 h-5" /></button>
          </div>
        </div>
      </div>

      {/* ── Agent Pipeline Bar ── */}
      <AnimatePresence>
        {showAgentBar && !isBooked && (
          <AgentPipeline
            activeAgent={activeAgent}
            completedAgents={completedAgents}
            currentStep={currentStep}
          />
        )}
      </AnimatePresence>

      {/* ── Chat Area ── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto py-3"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cg fill='%23ffffff' fill-opacity='0.055'%3E%3Cpath d='M40 0l40 40-40 40L0 40z'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
      >
        <DateSeparator
          label={new Date().toLocaleDateString([], {
            weekday: "long", month: "long", day: "numeric"
          })}
        />

        {/* Chat messages */}
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {/* Bedrock live steps */}
        <AnimatePresence>
          {bedrockSteps.length > 0 && (
            <BedrockLiveCard steps={bedrockSteps} />
          )}
        </AnimatePresence>

        {/* Flight cards */}
        <AnimatePresence>
          {flights.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-3 pb-2 space-y-2"
            >
              {flights.map((f) => (
                <div key={f.id} className="flex justify-start">
                  <div className="max-w-[90%] w-full">
                    <FlightCard flight={f} recommended={plan?.bestFlight.id === f.id} />
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hotel cards */}
        <AnimatePresence>
          {hotels.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-3 pb-2 space-y-2"
            >
              {hotels.map((h) => (
                <div key={h.id} className="flex justify-start">
                  <div className="max-w-[90%] w-full">
                    <HotelCard hotel={h} recommended={plan?.bestHotel.id === h.id} />
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Auto-book countdown */}
        <AnimatePresence>
          {countdown !== null && <AutoBookCountdown seconds={countdown} />}
        </AnimatePresence>

        {/* Booking live steps */}
        <AnimatePresence>
          {bookingSteps.length > 0 && <BookingLiveCard steps={bookingSteps} />}
        </AnimatePresence>

        {/* Typing indicator */}
        <AnimatePresence>
          {isLoading && bedrockSteps.length === 0 && bookingSteps.length === 0 && (
            <TypingIndicator />
          )}
        </AnimatePresence>
      </div>

      {/* ── WhatsApp Input Bar ── */}
      <div
        className="flex-shrink-0 border-t border-gray-200/50"
        style={{ background: "hsl(190,20%,84%)" }}
      >
        <ChatInput
          onSend={handleSend}
          isLoading={isLoading || countdown !== null}
          placeholder={
            isLoading
              ? "Searching..."
              : countdown !== null
                ? `Auto-booking in ${countdown}s...`
                : isBooked
                  ? "Search another trip... ✈️"
                  : "Where do you want to go? ✈️"
          }
        />
      </div>

      {/* ── Booking Confirmation Modal ── */}
      <AnimatePresence>
        {showBooking && plan && (
          <BookingConfirmation
            flight={{
              id: plan.bestFlight.id,
              airline: plan.bestFlight.airline,
              departure: plan.bestFlight.departure,
              arrival: plan.bestFlight.arrival,
              departureTime: plan.bestFlight.departureTime,
              arrivalTime: plan.bestFlight.arrivalTime,
              duration: plan.bestFlight.duration,
              price: plan.bestFlight.price,
              stops: plan.bestFlight.stops,
            }}
            hotel={{
              id: plan.bestHotel.id,
              name: plan.bestHotel.name,
              rating: plan.bestHotel.rating,
              location: plan.bestHotel.location,
              pricePerNight: plan.bestHotel.pricePerNight,
              amenities: plan.bestHotel.amenities,
            }}
            nights={plan.parsedRequest.nights}
            bookingRef={plan.bookingRef}
            onClose={() => setShowBooking(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
