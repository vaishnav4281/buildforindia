import { useState } from "react";
import HeroSection from "@/components/HeroSection";
import TripChat from "@/components/TripChat";
import { AnimatePresence, motion } from "framer-motion";

const Index = () => {
  const [showChat, setShowChat] = useState(false);

  return (
    <AnimatePresence mode="wait">
      {!showChat ? (
        <motion.div key="hero" exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
          <HeroSection onStartChat={() => setShowChat(true)} />
        </motion.div>
      ) : (
        <motion.div key="chat" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <TripChat onBack={() => setShowChat(false)} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Index;
