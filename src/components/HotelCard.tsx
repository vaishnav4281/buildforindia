import { motion } from "framer-motion";
import { Building2, Star, MapPin } from "lucide-react";

export interface HotelOption {
  id: string;
  name: string;
  rating: number;
  location: string;
  pricePerNight: number;
  amenities: string[];
  image?: string;
  selected?: boolean;
}

const HotelCard = ({ hotel, index, onSelect, recommended }: { hotel: HotelOption; index: number; onSelect: (id: string) => void; recommended?: boolean }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      onClick={() => onSelect(hotel.id)}
      className={`brutal-border overflow-hidden cursor-pointer transition-all hover:brutal-shadow-accent ${recommended ? "bg-yellow-light brutal-shadow" : hotel.selected ? "bg-lime-light brutal-shadow" : "bg-card"
        }`}
    >
      <div className="h-24 bg-muted flex items-center justify-center relative border-b-2 border-foreground">
        {hotel.image ? (
          <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover" />
        ) : (
          <Building2 className="w-6 h-6 text-muted-foreground" />
        )}
        {recommended && (
          <div className="absolute top-1.5 left-1.5 bg-yellow brutal-border px-1.5 py-0.5 text-[8px] font-display font-bold uppercase">
            ★ Best
          </div>
        )}
        <div className="absolute top-1.5 right-1.5 bg-card brutal-border px-1.5 py-0.5 flex items-center gap-0.5">
          <Star className="w-2.5 h-2.5 fill-foreground" />
          <span className="text-[10px] font-display font-bold">{hotel.rating}</span>
        </div>
      </div>

      <div className="p-2.5">
        <h4 className="font-display text-xs font-bold uppercase mb-1 truncate">{hotel.name}</h4>
        <div className="flex items-center gap-1 text-muted-foreground mb-1.5">
          <MapPin className="w-2.5 h-2.5" />
          <span className="text-[10px] font-display">{hotel.location}</span>
        </div>
        <div className="flex flex-wrap gap-1 mb-2">
          {hotel.amenities.slice(0, 2).map((a) => (
            <span key={a} className="text-[9px] font-display bg-muted brutal-border px-1.5 py-0.5 uppercase">{a}</span>
          ))}
        </div>
        <p className="text-right">
          <span className="font-display text-sm font-bold">₹{hotel.pricePerNight.toLocaleString('en-IN')}</span>
          <span className="text-[9px] font-display text-muted-foreground">/night</span>
        </p>
      </div>
    </motion.div>
  );
};

export default HotelCard;
