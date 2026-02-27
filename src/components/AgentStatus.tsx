import { motion, AnimatePresence } from "framer-motion";
import { Brain, Plane, Building2, BarChart3, CreditCard, Check } from "lucide-react";

export type AgentType = "planner" | "flight" | "hotel" | "optimization" | "booking";

interface AgentStatusProps {
  activeAgent: AgentType | null;
  completedAgents: AgentType[];
}

const agents: { id: AgentType; label: string; icon: React.ElementType; color: string }[] = [
  { id: "planner", label: "PLANNER", icon: Brain, color: "bg-yellow-light" },
  { id: "flight", label: "FLIGHT", icon: Plane, color: "bg-sky-neo-light" },
  { id: "hotel", label: "HOTEL", icon: Building2, color: "bg-coral-light" },
  { id: "optimization", label: "OPTIMIZER", icon: BarChart3, color: "bg-lime-light" },
  { id: "booking", label: "BOOKING", icon: CreditCard, color: "bg-yellow" },
];

const AgentStatus = ({ activeAgent, completedAgents }: AgentStatusProps) => {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto py-2">
      {agents.map((agent, i) => {
        const isActive = activeAgent === agent.id;
        const isCompleted = completedAgents.includes(agent.id);
        const Icon = agent.icon;

        return (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className={`flex items-center gap-1 px-2 py-1 text-[10px] font-display font-bold uppercase tracking-wider whitespace-nowrap brutal-border transition-all ${
              isActive
                ? `${agent.color} brutal-shadow`
                : isCompleted
                ? "bg-lime-light"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {isCompleted ? <Check className="w-3 h-3" /> : <Icon className={`w-3 h-3 ${isActive ? "animate-pulse-dot" : ""}`} />}
            <span>{agent.label}</span>
          </motion.div>
        );
      })}
    </div>
  );
};

export default AgentStatus;
