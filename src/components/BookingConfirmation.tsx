import { motion } from "framer-motion";
import {
  CheckCircle2,
  Plane,
  Building2,
  Calendar,
  DollarSign,
  X,
  Download,
  Share2,
  Star,
  Clock,
  MapPin,
  Shield,
} from "lucide-react";
import { FlightOption } from "./FlightCard";
import { HotelOption } from "./HotelCard";

interface BookingConfirmationProps {
  flight: FlightOption;
  hotel: HotelOption;
  nights: number;
  bookingRef?: string;
  onClose: () => void;
}

const BookingConfirmation = ({
  flight,
  hotel,
  nights,
  bookingRef,
  onClose,
}: BookingConfirmationProps) => {
  const totalCost = flight.price + hotel.pricePerNight * nights;
  const ref = bookingRef || "TG" + Math.random().toString(36).slice(2, 7).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 340 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl"
      >
        {/* ── Success Header ── */}
        <div className="bg-gradient-to-br from-[hsl(142,60%,22%)] to-[hsl(160,55%,28%)] p-6 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>

          <motion.div
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", damping: 15, delay: 0.1 }}
            className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3 border-2 border-white/30"
          >
            <CheckCircle2 className="w-9 h-9 text-white" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-white font-black text-xl mb-1">Booking Confirmed! 🎉</h2>
            <p className="text-green-200 text-sm">Your trip is officially booked</p>
            <div className="mt-3 inline-flex items-center gap-2 bg-white/15 rounded-full px-4 py-1.5 border border-white/20">
              <Shield className="w-3.5 h-3.5 text-green-200" />
              <span className="text-xs font-bold text-white tracking-widest">REF: {ref}</span>
            </div>
          </motion.div>
        </div>

        {/* ── Content ── */}
        <div className="overflow-y-auto max-h-[60vh]">

          {/* Flight Row */}
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                <Plane className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Flight</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-800 dark:text-gray-100 text-[15px]">{flight.airline}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[13px] font-semibold text-gray-600 dark:text-gray-300">{flight.departure}</span>
                  <div className="flex items-center gap-1">
                    <div className="w-6 h-px bg-gray-300 dark:bg-gray-600" />
                    <Plane className="w-3 h-3 text-gray-400 rotate-90" />
                    <div className="w-6 h-px bg-gray-300 dark:bg-gray-600" />
                  </div>
                  <span className="text-[13px] font-semibold text-gray-600 dark:text-gray-300">{flight.arrival}</span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-400">
                  <Clock className="w-3 h-3" />
                  <span>{flight.departureTime} – {flight.arrivalTime}</span>
                  <span>·</span>
                  <span className={flight.stops === 0 ? "text-green-500 font-semibold" : "text-orange-400"}>
                    {flight.stops === 0 ? "Non-stop" : `${flight.stops} stop`}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[18px] font-black text-[hsl(142,53%,35%)]">${flight.price}</p>
                <p className="text-[10px] text-gray-400">per person</p>
              </div>
            </div>
          </div>

          {/* Hotel Row */}
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-full bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center">
                <Building2 className="w-3.5 h-3.5 text-orange-500" />
              </div>
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Hotel</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-800 dark:text-gray-100 text-[15px]">{hotel.name}</p>
                <div className="flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3 text-gray-400" />
                  <span className="text-[11px] text-gray-400">{hotel.location}</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${i < Math.floor(hotel.rating) ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}`}
                    />
                  ))}
                  <span className="text-[11px] text-gray-500 ml-1">{hotel.rating}</span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-400">
                  <Calendar className="w-3 h-3" />
                  <span>{nights} nights × ${hotel.pricePerNight}/night</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[18px] font-black text-[hsl(142,53%,35%)]">${hotel.pricePerNight * nights}</p>
                <p className="text-[10px] text-gray-400">{nights} nights</p>
              </div>
            </div>
          </div>

          {/* Total Row */}
          <div className="px-5 py-4 bg-[hsl(142,53%,40%)]/5 dark:bg-[hsl(142,53%,40%)]/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[hsl(142,53%,35%)]" />
                <div>
                  <p className="font-bold text-gray-800 dark:text-gray-100 text-[15px]">Total Paid</p>
                  <p className="text-[10px] text-gray-400">Flight + {nights} nights hotel</p>
                </div>
              </div>
              <p className="text-[24px] font-black text-[hsl(142,53%,35%)]">${totalCost.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* ── Footer Buttons ── */}
        <div className="px-5 py-4 flex gap-2 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
          <motion.button
            whileTap={{ scale: 0.97 }}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Download className="w-4 h-4" />
            Save PDF
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Share
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl bg-[hsl(142,53%,40%)] text-white font-bold text-sm hover:bg-[hsl(142,53%,36%)] transition-colors"
          >
            Done ✓
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BookingConfirmation;
