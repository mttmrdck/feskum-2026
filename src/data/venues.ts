/**
 * Venue directory. Names are Universiti Malaya campus locations; descriptions
 * are written for this concept and imagery is illustrative stock photography.
 * Replace `image` with official venue photography when available.
 */
export interface Venue {
  id: string;
  name: string;
  shortName: string;
  zone: string;
  description: string;
  image: string;
  access: string;
  mapUrl: string;
}

const maps = (q: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

export const VENUES: Venue[] = [
  {
    id: "dtc",
    name: "Dewan Tunku Canselor",
    shortName: "DTC",
    zone: "Central Campus",
    description:
      "The ceremonial heart of convocation. Graduation sessions, the opening address and evening recitals take place beneath its long-span roof.",
    image: "/images/grand-hall.jpg",
    access: "Main entrance via Jalan Universiti. Ushers at every door during sessions.",
    mapUrl: maps("Dewan Tunku Canselor Universiti Malaya"),
  },
  {
    id: "dataran",
    name: "Dataran DTC",
    shortName: "Plaza",
    zone: "Central Campus",
    description:
      "The open-air plaza outside the hall becomes the festival ground: food bazaar by day, main stage by night.",
    image: "/images/confetti-crowd.jpg",
    access: "Open to the public. Step-free from the DTC drop-off point.",
    mapUrl: maps("Dewan Tunku Canselor Universiti Malaya"),
  },
  {
    id: "library",
    name: "Perpustakaan Utama UM",
    shortName: "Main Library",
    zone: "Academic Core",
    description:
      "Reading rooms and the exhibition foyer host archive displays and quiet programming between ceremonies.",
    image: "/images/glass-library.jpg",
    access: "Visitors register at the ground-floor counter. Bags are checked at the gate.",
    mapUrl: maps("Perpustakaan Utama Universiti Malaya"),
  },
  {
    id: "museum",
    name: "Muzium Seni Asia",
    shortName: "Asian Art Museum",
    zone: "Academic Core",
    description:
      "Universiti Malaya's art museum opens its galleries to graduate work and a curated festival exhibition.",
    image: "/images/white-gallery.jpg",
    access: "Free entry. Photography permitted without flash.",
    mapUrl: maps("Muzium Seni Asia Universiti Malaya"),
  },
  {
    id: "theatre",
    name: "Panggung Eksperimen",
    shortName: "Experimental Theatre",
    zone: "Arts Quarter",
    description:
      "An intimate black-box theatre for recitals, talent nights and the distinguished lecture series.",
    image: "/images/lecture-theatre.jpg",
    access: "Seated events. Doors open 30 minutes before start.",
    mapUrl: maps("Panggung Eksperimen Universiti Malaya"),
  },
  {
    id: "sports",
    name: "Pusat Sukan UM",
    shortName: "Sports Centre",
    zone: "Sports Precinct",
    description:
      "Indoor courts and the running track host the festival's competitive and community sporting events.",
    image: "/images/badminton.jpg",
    access: "Sports attire required for participants. Spectator seating on the upper tier.",
    mapUrl: maps("Pusat Sukan Universiti Malaya"),
  },
];

export const venueById = (id: string) => VENUES.find((v) => v.id === id)!;
