// ─── AI Client Helper (Server-side Proxy for Vercel) ─────────────────────────

async function fetchAI(params: {
  messages: any[];
  response_format?: { type: "json_object" };
  temperature?: number;
}) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to fetch from AI API");
  }

  return await response.json();
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ParsedTripRequest {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  nights: number;
  flightBudget: number;
  hotelBudgetPerNight: number;
  travelers: number;
  preferences: string[];
}

export interface FlightResult {
  id: string;
  airline: string;
  departure: string;
  arrival: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  stops: number;
  aircraft?: string;
  amenities?: string[];
  co2?: string;
}

export interface HotelResult {
  id: string;
  name: string;
  rating: number;
  location: string;
  pricePerNight: number;
  amenities: string[];
  description?: string;
  distanceFromCenter?: string;
  reviewCount?: number;
}

export interface TravelPlan {
  parsedRequest: ParsedTripRequest;
  flights: FlightResult[];
  hotels: HotelResult[];
  bestFlight: FlightResult;
  bestHotel: HotelResult;
  reasoning: string;
  totalCost: number;
  tips: string[];
  savingsVsAlternative: number;
  bookingRef: string;
}

// ─── Helper ────────────────────────────────────────────────────────────────────

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const genBookingRef = () =>
  "TG" + Date.now().toString(36).toUpperCase().slice(-5) +
  Math.random().toString(36).substring(2, 5).toUpperCase();

// ─── Step 1: Parse user request with ChatGPT ──────────────────────────────────

export async function parseUserRequest(userMessage: string): Promise<ParsedTripRequest> {
  const today = new Date();
  const future = new Date(today);
  future.setDate(today.getDate() + 30);
  const futureStr = future.toISOString().split("T")[0];
  const futureReturn = new Date(future);
  futureReturn.setDate(future.getDate() + 7);
  const futureReturnStr = futureReturn.toISOString().split("T")[0];

  const data = await fetchAI({
    messages: [
      {
        role: "system",
        content: `You are a travel parser. Extract trip details from the user's message and return ONLY valid JSON.
Default values if not specified:
- departureDate: "${futureStr}"
- returnDate: "${futureReturnStr}"  
- nights: 7
- flightBudget: 800
- hotelBudgetPerNight: 150
- travelers: 1
- preferences: []

Fields: origin (city or airport code), destination (city or airport code), departureDate (YYYY-MM-DD), returnDate (YYYY-MM-DD), nights (integer), flightBudget (number, USD), hotelBudgetPerNight (number, USD), travelers (integer), preferences (array of strings like "non-stop", "luxury", "budget", "beach", "family")`,
      },
      { role: "user", content: userMessage },
    ],
    response_format: { type: "json_object" },
    temperature: 0.2,
  });

  return JSON.parse(data.content || "{}") as ParsedTripRequest;
}

// ─── Step 2: Search flights with ChatGPT ──────────────────────────────────────

export async function searchFlights(request: ParsedTripRequest): Promise<FlightResult[]> {
  const data = await fetchAI({
    messages: [
      {
        role: "system",
        content: `You are a flight search engine. Generate 3 realistic flight options as a JSON array under the key "flights".
Each flight must have:
- id: "f1" / "f2" / "f3"
- airline: real airline name serving this route
- departure: origin airport code (IATA)
- arrival: destination airport code (IATA)
- departureTime: "HH:MM"
- arrivalTime: "HH:MM"
- duration: e.g. "8h 45m"
- price: USD number (vary: one near budget, one 15% below, one 10% above)
- stops: 0 or 1
- aircraft: e.g. "Boeing 777-300ER"
- amenities: 3-4 items like ["WiFi", "USB Charging", "Meals included"]
- co2: e.g. "245 kg CO₂"

Make one non-stop premium, one budget with 1 stop, one mid-range non-stop.`,
      },
      {
        role: "user",
        content: `Route: ${request.origin} → ${request.destination}
Departure: ${request.departureDate}, Return: ${request.returnDate}
Budget: $${request.flightBudget} per person
Travelers: ${request.travelers}
Preferences: ${request.preferences.join(", ") || "none"}`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.75,
  });

  const parsed = JSON.parse(data.content || "{}");
  return (parsed.flights || []) as FlightResult[];
}

// ─── Step 3: Search hotels with ChatGPT ───────────────────────────────────────

export async function searchHotels(request: ParsedTripRequest): Promise<HotelResult[]> {
  const data = await fetchAI({
    messages: [
      {
        role: "system",
        content: `You are a hotel search engine. Generate 3 realistic hotel options as a JSON array under the key "hotels".
Each hotel must have:
- id: "h1" / "h2" / "h3"
- name: real or highly realistic hotel name for this city
- rating: 3.6 to 5.0
- location: specific neighborhood/area
- pricePerNight: USD (one budget 30% below budget, one at budget, one luxury 40% above)
- amenities: 4-6 items like ["Pool", "Spa", "Free Breakfast", "Gym", "Airport Shuttle"]
- description: 1-2 sentences about the property
- distanceFromCenter: e.g. "1.2 km from city center"
- reviewCount: realistic number like 4821`,
      },
      {
        role: "user",
        content: `Destination: ${request.destination}
Dates: ${request.departureDate} to ${request.returnDate} (${request.nights} nights)
Budget: $${request.hotelBudgetPerNight} per night
Guests: ${request.travelers}
Preferences: ${request.preferences.join(", ") || "none"}`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.75,
  });

  const parsed = JSON.parse(data.content || "{}");
  return (parsed.hotels || []) as HotelResult[];
}

// ─── Step 4: Bedrock Simulation — picks cheapest best-value combo ─────────────
// Simulates AWS Bedrock agentic reasoning with live streaming steps

export interface BedrockSimStep {
  label: string;
  detail: string;
  duration: number;
}

export async function simulateBedrockOptimization(
  request: ParsedTripRequest,
  flights: FlightResult[],
  hotels: HotelResult[],
  onStep: (step: BedrockSimStep) => void
): Promise<{
  bestFlight: FlightResult;
  bestHotel: HotelResult;
  reasoning: string;
  tips: string[];
  savingsVsAlternative: number;
}> {
  // Simulate Bedrock agent streaming reasoning steps
  const steps: BedrockSimStep[] = [
    { label: "🔗 Connecting to AWS Bedrock us-east-1...", detail: "Initializing Claude 3 Sonnet endpoint", duration: 500 },
    { label: "📊 Loading price matrix...", detail: `Processing ${flights.length * 14} fare combinations`, duration: 700 },
    { label: "🏷️ Running dynamic pricing analysis...", detail: "Historical trends + demand forecasting", duration: 800 },
    { label: "🌍 Geo-scoring hotel locations...", detail: `Scoring ${hotels.length} properties vs landmarks`, duration: 600 },
    { label: "💰 Cheapest combo pass 1/3...", detail: "Ranking by total trip cost", duration: 600 },
    { label: "✈️ Value scoring pass 2/3...", detail: "Factoring stops, duration, reliability", duration: 700 },
    { label: "🏆 Final selection pass 3/3...", detail: "Locking in lowest-cost best-value choice", duration: 600 },
  ];

  for (const step of steps) {
    onStep(step);
    await delay(step.duration);
  }

  // ChatGPT picks the cheapest best-value flight + hotel
  const data = await fetchAI({
    messages: [
      {
        role: "system",
        content: `You are an agentic travel cost optimizer (simulating AWS Bedrock Claude).
Your SOLE priority: pick the combination with the LOWEST total trip cost (flight price + hotel pricePerNight × nights).
Secondary: prefer non-stop flights and higher hotel ratings when prices are equal.
Return ONLY valid JSON:
{
  "bestFlightId": "f1 or f2 or f3",
  "bestHotelId": "h1 or h2 or h3",
  "totalCost": <number>,
  "reasoning": "One sentence on why this is the best cheapest combo.",
  "tips": ["practical tip 1", "practical tip 2", "practical tip 3"]
}`,
      },
      {
        role: "user",
        content: `Route: ${request.origin} → ${request.destination} · ${request.nights} nights · ${request.travelers} traveler(s)

FLIGHTS:
${flights.map((f) => `[${f.id}] ${f.airline} $${f.price} ${f.stops === 0 ? "non-stop" : f.stops + " stop"} ${f.duration}`).join("\n")}

HOTELS:
${hotels.map((h) => `[${h.id}] ${h.name} $${h.pricePerNight}/night ★${h.rating} → ${request.nights} nights = $${h.pricePerNight * request.nights}`).join("\n")}

Pick the CHEAPEST total combo.`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.1,
  });

  const result = JSON.parse(data.content || "{}");

  const bestFlight = flights.find((f) => f.id === result.bestFlightId) || flights.reduce((a, b) => a.price < b.price ? a : b);
  const bestHotel = hotels.find((h) => h.id === result.bestHotelId) || hotels.reduce((a, b) => a.pricePerNight < b.pricePerNight ? a : b);

  // Savings vs most expensive option
  const maxFlight = flights.reduce((a, b) => a.price > b.price ? a : b);
  const maxHotel = hotels.reduce((a, b) => a.pricePerNight > b.pricePerNight ? a : b);
  const savingsVsAlternative = Math.max(0,
    (maxFlight.price - bestFlight.price) + (maxHotel.pricePerNight - bestHotel.pricePerNight) * request.nights
  );

  return {
    bestFlight,
    bestHotel,
    reasoning: result.reasoning || "Cheapest total cost combination selected automatically.",
    tips: result.tips || [
      "Book early to lock in this rate",
      "Check visa requirements before travel",
      "Get travel insurance for added protection",
    ],
    savingsVsAlternative,
  };
}

// ─── Step 5: Simulate Booking ─────────────────────────────────────────────────

export interface BookingSimStep {
  label: string;
  detail: string;
  duration: number;
}

export async function simulateBooking(
  plan: TravelPlan,
  onStep: (step: BookingSimStep) => void
): Promise<{ bookingRef: string; confirmationTime: string }> {
  const bookingSteps: BookingSimStep[] = [
    { label: "🔐 Securing payment gateway...", detail: "256-bit SSL encryption active", duration: 700 },
    { label: "✈️ Reserving flight seats...", detail: `Contacting ${plan.bestFlight.airline} reservation system`, duration: 1200 },
    { label: "🏨 Holding hotel room...", detail: `Confirming ${plan.bestHotel.name} availability`, duration: 1000 },
    { label: "💳 Processing payment...", detail: `Charging $${plan.totalCost.toLocaleString()}`, duration: 1500 },
    { label: "📧 Sending confirmation emails...", detail: "Emailing itinerary and e-tickets", duration: 600 },
    { label: "✅ Booking finalized!", detail: "All confirmations secured", duration: 400 },
  ];

  for (const step of bookingSteps) {
    onStep(step);
    await delay(step.duration);
  }

  return {
    bookingRef: plan.bookingRef,
    confirmationTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };
}

// ─── Master orchestrator ──────────────────────────────────────────────────────

export async function orchestrateTravelSearch(
  userMessage: string,
  onAgentUpdate: (agent: string, status: "active" | "done" | "step", message?: string) => void
): Promise<TravelPlan> {

  // Step 1: Planner (ChatGPT)
  onAgentUpdate("planner", "active", "Parsing your travel request...");
  const parsedRequest = await parseUserRequest(userMessage);
  onAgentUpdate("planner", "done", `${parsedRequest.origin} → ${parsedRequest.destination} · ${parsedRequest.nights} nights · $${parsedRequest.flightBudget} flight budget`);

  // Step 2: Flights (ChatGPT)
  onAgentUpdate("flight", "active", "Searching live flight inventory...");
  const flights = await searchFlights(parsedRequest);
  onAgentUpdate("flight", "done", `Found ${flights.length} flight options`);

  // Step 3: Hotels (ChatGPT)
  onAgentUpdate("hotel", "active", "Scanning hotel availability...");
  const hotels = await searchHotels(parsedRequest);
  onAgentUpdate("hotel", "done", `Found ${hotels.length} hotel options`);

  // Step 4: Bedrock Simulation (Optimization)
  onAgentUpdate("optimization", "active", "AWS Bedrock agent initializing...");

  const { bestFlight, bestHotel, reasoning, tips, savingsVsAlternative } =
    await simulateBedrockOptimization(
      parsedRequest,
      flights,
      hotels,
      (step) => {
        onAgentUpdate("optimization", "step", `${step.label} ${step.detail}`);
      }
    );

  onAgentUpdate("optimization", "done", "Optimal combination selected");

  const totalCost = bestFlight.price + bestHotel.pricePerNight * parsedRequest.nights;
  const bookingRef = genBookingRef();

  return {
    parsedRequest,
    flights,
    hotels,
    bestFlight,
    bestHotel,
    reasoning,
    totalCost,
    tips,
    savingsVsAlternative,
    bookingRef,
  };
}
