import { motion } from "framer-motion";
import { Check, CheckCheck } from "lucide-react";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  status?: "sent" | "delivered" | "read";
}

const ChatMessage = ({ message }: { message: Message }) => {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} px-3 mb-1`}
    >
      <div
        className={`relative max-w-[80%] sm:max-w-[65%] rounded-lg px-3 pt-2 pb-1 shadow-sm ${isUser
            ? "bg-[hsl(142,53%,40%)] text-white rounded-br-none"
            : "bg-white dark:bg-[hsl(195,14%,22%)] text-gray-800 dark:text-gray-100 rounded-bl-none"
          }`}
        style={{ wordBreak: "break-word" }}
      >
        {/* Bubble tail */}
        {isUser ? (
          <div
            className="absolute bottom-0 right-0 translate-x-[6px]"
            style={{
              width: 0, height: 0,
              borderStyle: "solid",
              borderWidth: "0 0 10px 10px",
              borderColor: "transparent transparent hsl(142,53%,40%) transparent",
            }}
          />
        ) : (
          <div
            className="absolute bottom-0 left-0 -translate-x-[6px]"
            style={{
              width: 0, height: 0,
              borderStyle: "solid",
              borderWidth: "0 10px 10px 0",
              borderColor: `transparent white transparent transparent`,
            }}
          />
        )}

        {/* Message content */}
        <p className="text-[13.5px] leading-[1.5] whitespace-pre-wrap">{message.content}</p>

        {/* Meta row */}
        <div className={`flex items-center gap-1 justify-end mt-0.5`}>
          <span
            className={`text-[10px] leading-none ${isUser ? "text-white/70" : "text-gray-400 dark:text-gray-500"
              }`}
          >
            {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
          {isUser && (
            <span className="text-white/80">
              {message.status === "read" ? (
                <CheckCheck className="w-3.5 h-3.5 text-sky-300" />
              ) : message.status === "delivered" ? (
                <CheckCheck className="w-3.5 h-3.5" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ChatMessage;
