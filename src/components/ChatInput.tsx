import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Mic, Paperclip, Smile } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

const ChatInput = ({ onSend, isLoading, placeholder = "Message TravelGenie..." }: ChatInputProps) => {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSend(input.trim());
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  const hasText = input.trim().length > 0;

  return (
    <div className="flex items-end gap-2 px-2 py-2">
      {/* Attachment icon */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        type="button"
        className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-[hsl(142,53%,40%)] text-white shadow-sm"
      >
        <Paperclip className="w-4 h-4" />
      </motion.button>

      {/* Input box */}
      <div className="flex-1 flex items-end gap-2 bg-white dark:bg-[hsl(195,14%,22%)] rounded-3xl px-4 py-2 shadow-sm min-h-[42px]">
        <Smile className="w-5 h-5 text-gray-400 flex-shrink-0 mb-0.5 cursor-pointer" />
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading}
          rows={1}
          className="flex-1 bg-transparent text-[14px] text-gray-800 dark:text-gray-100 placeholder:text-gray-400 outline-none resize-none max-h-[120px] leading-[1.5] py-0.5"
          style={{ height: "auto" }}
        />
      </div>

      {/* Send / Mic button */}
      <AnimatePresence mode="wait">
        {hasText ? (
          <motion.button
            key="send"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ duration: 0.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-[hsl(142,53%,40%)] text-white shadow-md disabled:opacity-50"
          >
            <Send className="w-4 h-4 translate-x-0.5" />
          </motion.button>
        ) : (
          <motion.button
            key="mic"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.15 }}
            whileTap={{ scale: 0.9 }}
            type="button"
            className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-[hsl(142,53%,40%)] text-white shadow-md"
          >
            <Mic className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatInput;
