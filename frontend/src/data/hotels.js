const roomDetailsByType = {
  Deluxe: {
    guests: "2 Guests",
    size: "320 sq ft",
    bedType: "King Bed",
    description:
      "A comfortable room with city views, modern furnishings, and all essential amenities for a relaxed stay.",
    amenities: ["Wi-Fi", "Breakfast", "Work Desk"],
  },
  Executive: {
    guests: "3 Guests",
    size: "420 sq ft",
    bedType: "King Bed",
    description:
      "A spacious room with premium comforts, a dedicated work area, and enhanced services for business or leisure.",
    amenities: ["Wi-Fi", "Breakfast", "Lounge Access"],
  },
  Suite: {
    guests: "4 Guests",
    size: "650 sq ft",
    bedType: "King Bed",
    description:
      "An elegant suite with separate living space, upgraded amenities, and extra room for families or longer stays.",
    amenities: ["Wi-Fi", "Breakfast", "Living Area"],
  },
};

const addRoomDetails = (hotel) => ({
  ...hotel,
  rooms: hotel.rooms.map((room) => ({
    ...roomDetailsByType[room.type],
    ...room,
    id: `${hotel.id}-${room.type.toLowerCase()}`,
    name: `${room.type} Room`,
  })),
});

export const hotels = [
  {
    id: "blr-001",
    name: "The Leela Palace Bengaluru",
    city: "Bangalore",
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&q=80",
    price: 14500,
    description:
      "A grand luxury hotel on Old Airport Road with palace-inspired architecture, landscaped gardens, and polished service for business and leisure stays.",
    highlights: ["Palace-style interiors", "Award-winning dining", "Central business location"],
    amenities: ["Free Wi-Fi", "Swimming Pool", "Spa", "Fitness Centre", "Airport Transfers"],
    rooms: [
      { type: "Deluxe", price: 14500, availableRooms: 8 },
      { type: "Executive", price: 18200, availableRooms: 5 },
      { type: "Suite", price: 28500, availableRooms: 3 },
    ],
  },
  {
    id: "blr-002",
    name: "Taj West End",
    city: "Bangalore",
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=900&q=80",
    price: 12800,
    description:
      "A heritage urban resort set across leafy grounds near Race Course Road, known for spacious rooms, quiet courtyards, and classic hospitality.",
    highlights: ["Heritage property", "Large garden campus", "Near MG Road"],
    amenities: ["Free Wi-Fi", "Pool", "Spa", "Multi-cuisine Restaurant", "Valet Parking"],
    rooms: [
      { type: "Deluxe", price: 12800, availableRooms: 10 },
      { type: "Executive", price: 16400, availableRooms: 6 },
      { type: "Suite", price: 24800, availableRooms: 2 },
    ],
  },
  {
    id: "blr-003",
    name: "ITC Gardenia",
    city: "Bangalore",
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=900&q=80",
    price: 11200,
    description:
      "An upscale hotel close to Cubbon Park and UB City with refined rooms, sustainable design details, and strong dining options.",
    highlights: ["Close to UB City", "Luxury business facilities", "Premium restaurants"],
    amenities: ["Free Wi-Fi", "Business Centre", "Spa", "Pool", "EV Charging"],
    rooms: [
      { type: "Deluxe", price: 11200, availableRooms: 12 },
      { type: "Executive", price: 14800, availableRooms: 7 },
      { type: "Suite", price: 22900, availableRooms: 3 },
    ],
  },
  {
    id: "goa-001",
    name: "Taj Fort Aguada Resort & Spa",
    city: "Goa",
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1571003123891-b12706ff9d9a?w=900&q=80",
    price: 15800,
    description:
      "A coastal resort in Candolim overlooking the Arabian Sea, offering beach access, Portuguese-inspired charm, and relaxed luxury.",
    highlights: ["Sea-facing views", "Direct beach access", "Historic fort setting"],
    amenities: ["Free Wi-Fi", "Beach Access", "Infinity Pool", "Spa", "Kids Club"],
    rooms: [
      { type: "Deluxe", price: 15800, availableRooms: 9 },
      { type: "Executive", price: 19400, availableRooms: 5 },
      { type: "Suite", price: 31500, availableRooms: 2 },
    ],
  },
  {
    id: "goa-002",
    name: "W Goa",
    city: "Goa",
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=900&q=80",
    price: 14200,
    description:
      "A lively resort near Vagator Beach with bold design, sunset views, modern rooms, and an energetic poolside atmosphere.",
    highlights: ["Vagator Beach location", "Sunset deck", "Vibrant nightlife"],
    amenities: ["Free Wi-Fi", "Pool", "Spa", "Bar", "Pet Friendly"],
    rooms: [
      { type: "Deluxe", price: 14200, availableRooms: 11 },
      { type: "Executive", price: 17600, availableRooms: 6 },
      { type: "Suite", price: 26800, availableRooms: 3 },
    ],
  },
  {
    id: "goa-003",
    name: "The Leela Goa",
    city: "Goa",
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=900&q=80",
    price: 17600,
    description:
      "A refined South Goa resort in Cavelossim with lagoon-style landscapes, private beach access, and spacious rooms for premium vacations.",
    highlights: ["Private beach", "Lagoon views", "South Goa setting"],
    amenities: ["Free Wi-Fi", "Private Beach", "Golf Course", "Spa", "Pool"],
    rooms: [
      { type: "Deluxe", price: 17600, availableRooms: 7 },
      { type: "Executive", price: 21800, availableRooms: 4 },
      { type: "Suite", price: 34200, availableRooms: 2 },
    ],
  },
  {
    id: "mum-001",
    name: "The Oberoi Mumbai",
    city: "Mumbai",
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900&q=80",
    price: 19200,
    description:
      "A polished luxury hotel on Marine Drive with sea-facing rooms, excellent service, and easy access to Nariman Point and Colaba.",
    highlights: ["Marine Drive views", "Business district access", "Fine dining"],
    amenities: ["Free Wi-Fi", "Sea View Rooms", "Pool", "Spa", "Business Centre"],
    rooms: [
      { type: "Deluxe", price: 19200, availableRooms: 8 },
      { type: "Executive", price: 23600, availableRooms: 5 },
      { type: "Suite", price: 38800, availableRooms: 2 },
    ],
  },
  {
    id: "mum-002",
    name: "Taj Mahal Palace Mumbai",
    city: "Mumbai",
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1494526585095-c41746248156?w=900&q=80",
    price: 18400,
    description:
      "An iconic heritage hotel in Colaba facing the Gateway of India, known for historic architecture, premium restaurants, and elegant rooms.",
    highlights: ["Gateway of India views", "Heritage landmark", "Iconic restaurants"],
    amenities: ["Free Wi-Fi", "Pool", "Spa", "Luxury Concierge", "Airport Transfers"],
    rooms: [
      { type: "Deluxe", price: 18400, availableRooms: 9 },
      { type: "Executive", price: 22800, availableRooms: 4 },
      { type: "Suite", price: 36500, availableRooms: 2 },
    ],
  },
  {
    id: "mum-003",
    name: "JW Marriott Mumbai Juhu",
    city: "Mumbai",
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900&q=80",
    price: 15600,
    description:
      "A beachfront hotel in Juhu with contemporary rooms, lively restaurants, and convenient access to the airport and western suburbs.",
    highlights: ["Juhu Beach location", "Airport convenience", "Popular dining outlets"],
    amenities: ["Free Wi-Fi", "Beach Access", "Pool", "Spa", "Fitness Centre"],
    rooms: [
      { type: "Deluxe", price: 15600, availableRooms: 13 },
      { type: "Executive", price: 19600, availableRooms: 7 },
      { type: "Suite", price: 29800, availableRooms: 3 },
    ],
  },
  {
    id: "del-001",
    name: "The Imperial New Delhi",
    city: "Delhi",
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=900&q=80",
    price: 16800,
    description:
      "A landmark hotel near Connaught Place with colonial-era character, art-filled corridors, elegant rooms, and celebrated restaurants.",
    highlights: ["Near Connaught Place", "Heritage architecture", "Art collection"],
    amenities: ["Free Wi-Fi", "Pool", "Spa", "Heritage Dining", "Valet Parking"],
    rooms: [
      { type: "Deluxe", price: 16800, availableRooms: 8 },
      { type: "Executive", price: 20800, availableRooms: 5 },
      { type: "Suite", price: 32400, availableRooms: 2 },
    ],
  },
  {
    id: "del-002",
    name: "The Leela Palace New Delhi",
    city: "Delhi",
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=900&q=80",
    price: 19800,
    description:
      "A premium Chanakyapuri hotel with grand interiors, spacious rooms, rooftop pool, and quick access to embassies and central Delhi.",
    highlights: ["Chanakyapuri location", "Rooftop pool", "Luxury interiors"],
    amenities: ["Free Wi-Fi", "Rooftop Pool", "Spa", "Fine Dining", "Business Centre"],
    rooms: [
      { type: "Deluxe", price: 19800, availableRooms: 7 },
      { type: "Executive", price: 24400, availableRooms: 4 },
      { type: "Suite", price: 39600, availableRooms: 2 },
    ],
  },
  {
    id: "del-003",
    name: "Andaz Delhi",
    city: "Delhi",
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1590073242678-70ee3fc28f8e?w=900&q=80",
    price: 9800,
    description:
      "A modern Aerocity hotel with large rooms, local design touches, airport access, and practical facilities for business travellers.",
    highlights: ["Aerocity location", "Close to airport", "Modern design"],
    amenities: ["Free Wi-Fi", "Pool", "Fitness Centre", "Restaurant", "Airport Shuttle"],
    rooms: [
      { type: "Deluxe", price: 9800, availableRooms: 16 },
      { type: "Executive", price: 12800, availableRooms: 9 },
      { type: "Suite", price: 21500, availableRooms: 4 },
    ],
  },
  {
    id: "chn-001",
    name: "ITC Grand Chola",
    city: "Chennai",
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=900&q=80",
    price: 13200,
    description:
      "A grand luxury hotel in Guindy inspired by Chola architecture, offering extensive dining, large event spaces, and elegant rooms.",
    highlights: ["Guindy location", "Grand architecture", "Large convention spaces"],
    amenities: ["Free Wi-Fi", "Pool", "Spa", "Business Centre", "Multiple Restaurants"],
    rooms: [
      { type: "Deluxe", price: 13200, availableRooms: 12 },
      { type: "Executive", price: 16800, availableRooms: 7 },
      { type: "Suite", price: 27400, availableRooms: 3 },
    ],
  },
  {
    id: "chn-002",
    name: "Taj Coromandel",
    city: "Chennai",
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=900&q=80",
    price: 11800,
    description:
      "A classic Chennai hotel in Nungambakkam with refined rooms, dependable service, and convenient access to shopping and business areas.",
    highlights: ["Nungambakkam address", "Classic luxury", "Central city access"],
    amenities: ["Free Wi-Fi", "Pool", "Spa", "Restaurant", "Valet Parking"],
    rooms: [
      { type: "Deluxe", price: 11800, availableRooms: 11 },
      { type: "Executive", price: 15200, availableRooms: 6 },
      { type: "Suite", price: 23800, availableRooms: 3 },
    ],
  },
  {
    id: "chn-003",
    name: "The Leela Palace Chennai",
    city: "Chennai",
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=900&q=80",
    price: 14600,
    description:
      "A seafront luxury hotel near MRC Nagar with spacious rooms, Bay of Bengal views, refined dining, and a calm resort-like feel.",
    highlights: ["Seafront location", "Bay views", "Resort-style stay"],
    amenities: ["Free Wi-Fi", "Sea View Rooms", "Pool", "Spa", "Fine Dining"],
    rooms: [
      { type: "Deluxe", price: 14600, availableRooms: 9 },
      { type: "Executive", price: 18400, availableRooms: 5 },
      { type: "Suite", price: 29200, availableRooms: 2 },
    ],
  },
].map(addRoomDetails);

export const popularDestinations = hotels.reduce((destinations, hotel) => {
  const existingDestination = destinations.find((destination) => destination.city === hotel.city);
  const destinationHotel = {
    id: hotel.id,
    name: hotel.name,
    city: hotel.city,
    rating: hotel.rating,
    price: hotel.price,
    image: hotel.image,
  };

  if (existingDestination) {
    existingDestination.hotels.push(destinationHotel);
    return destinations;
  }

  return [
    ...destinations,
    {
      city: hotel.city,
      hotels: [destinationHotel],
    },
  ];
}, []);

export default hotels;
