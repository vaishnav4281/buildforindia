import { motion } from "framer-motion";
import { Plane, Clock, ArrowRight } from "lucide-react";

export interface FlightOption {
  id: string;
  airline: string;
  departure: string;
  arrival: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  stops: number;
  selected?: boolean;
}

const FlightCard = ({ flight, index, onSelect, recommended }: { flight: FlightOption; index: number; onSelect: (id: string) => void; recommended?: boolean }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
      onClick={() => onSelect(flight.id)}
      className={`brutal-border p-3 cursor-pointer transition-all hover:brutal-shadow-accent ${
        recommended ? "bg-yellow-light brutal-shadow" : flight.selected ? "bg-lime-light brutal-shadow" : "bg-card"
      }`}
    >
      {recommended && (
        <div className="bg-yellow brutal-border px-2 py-0.5 text-[9px] font-display font-bold uppercase tracking-wider inline-block mb-2">
          ★ Best Pick
        </div>
      )}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-sky-neo-light brutal-border flex items-center justify-center">
            <Plane className="w-3 h-3" />
          </div>
          <span className="font-display text-xs font-bold uppercase">{flight.airline}</span>
        </div>
        <span className="font-display text-lg font-bold">${flight.price}</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="font-display text-base font-bold">{flight.departureTime}</p>
          <p className="text-[10px] font-display text-muted-foreground uppercase">{flight.departure}</p>
        </div>
        <div className="flex-1 mx-3 flex flex-col items-center">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="w-2.5 h-2.5" />
            <span className="text-[10px] font-display">{flight.duration}</span>
          </div>
          <div className="w-full flex items-center gap-1 my-0.5">
            <div className="flex-1 h-0.5 bg-foreground/20" />
            <ArrowRight className="w-3 h-3" />
          </div>
          <span className="text-[9px] font-display text-muted-foreground uppercase">
            {flight.stops === 0 ? "Direct" : `${flight.stops} stop`}
          </span>
        </div>
        <div className="text-right">
          <p className="font-display text-base font-bold">{flight.arrivalTime}</p>
          <p className="text-[10px] font-display text-muted-foreground uppercase">{flight.arrival}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default FlightCard;
