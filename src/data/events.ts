import type { Category } from "./categories";

/**
 * ⚠️ SAMPLE PROGRAMME. Every event below is illustrative placeholder content
 * for the FESKUM 2026 concept. None of it is an official Universiti Malaya
 * announcement. Replace with the published programme from umconvo.um.edu.my.
 *
 * To add or update an event, edit this array only. Every view (explorer,
 * timeline, venues, detail) reads from here.
 */

/** Visual archetype of a card. Drives its shape and material, not its content. */
export type EventKind =
  | "featured"
  | "standard"
  | "performance"
  | "exhibition"
  | "academic"
  | "special";

/** Art-directed slide composition used by the event slider. */
export type Scene = "fullbleed" | "split" | "typographic" | "collage" | "poster" | "exhibition";

export interface ConvoEvent {
  id: string;
  title: string;
  category: Category;
  kind: EventKind;
  scene: Scene;
  /** ISO date, YYYY-MM-DD (local campus time, MYT). */
  date: string;
  /** 24h HH:mm */
  startTime: string;
  endTime: string;
  /** Venue id from venues.ts */
  venue: string;
  tagline: string;
  description: string;
  image: string;
  featured: boolean;
  highlights: string[];
  /** Absent means walk-in / details to be announced. */
  registrationUrl?: string;
  registration: string;
  announcement?: string;
  organiser: string;
}

export const IS_SAMPLE_DATA = true;

export const EVENTS: ConvoEvent[] = [
  {
    id: "istiadat-konvokesyen",
    title: "Istiadat Konvokesyen: Opening Session",
    category: "Graduation",
    kind: "featured",
    scene: "fullbleed",
    date: "2026-11-28",
    startTime: "08:00",
    endTime: "12:30",
    venue: "dtc",
    tagline: "The first walk across the stage.",
    description:
      "The opening ceremonial session of convocation week. Graduands process into the hall in full academic dress, the Chancellor's address opens proceedings and the first scrolls are conferred.",
    image: "/images/graduates-gowns.jpg",
    featured: true,
    highlights: [
      "Academic procession",
      "Chancellor's address",
      "Conferment of scrolls",
      "Live stream for families outside the hall",
    ],
    registration: "Graduands and two registered guests only. Guest passes are issued with the convocation kit.",
    announcement: "Graduands must be seated 60 minutes before the procession.",
    organiser: "Sample: Convocation Secretariat",
  },
  {
    id: "malam-gemilang",
    title: "Malam Gemilang Festival Concert",
    category: "Entertainment",
    kind: "featured",
    scene: "poster",
    date: "2026-11-28",
    startTime: "20:30",
    endTime: "23:00",
    venue: "dataran",
    tagline: "Opening night, under open sky.",
    description:
      "The festival's opening-night concert on the plaza main stage. Student bands open, followed by headline acts and a closing light sequence across the hall facade.",
    image: "/images/stage-glow.jpg",
    featured: true,
    highlights: ["Main-stage headline set", "Student band showcase", "Facade light sequence"],
    registration: "Free entry, standing. Gates open 19:30.",
    organiser: "Sample: Student Representative Council",
  },
  {
    id: "bazar-konvo",
    title: "Bazar Konvo",
    category: "Food & Lifestyle",
    kind: "featured",
    scene: "collage",
    date: "2026-11-29",
    startTime: "10:00",
    endTime: "22:00",
    venue: "dataran",
    tagline: "Every flavour of the festival, in one plaza.",
    description:
      "More than sixty stalls of street food, flowers, graduation gifts and student-run brands, running through the festival week. Families can find shaded seating along the plaza edge.",
    image: "/images/food-spread.jpg",
    featured: true,
    highlights: ["60+ stalls", "Flower & gift row", "Student brands", "Shaded family seating"],
    registration: "Open to all. No registration needed.",
    organiser: "Sample: Festival Committee",
  },
  {
    id: "photo-walk",
    title: "Graduate Photo Walk",
    category: "Special Activities",
    kind: "special",
    scene: "split",
    date: "2026-11-29",
    startTime: "07:30",
    endTime: "10:00",
    venue: "dataran",
    tagline: "Golden-hour portraits across campus.",
    description:
      "A guided morning route past the campus's most photographed corners, with volunteer photographers stationed at each stop. Bring your gown and mortarboard.",
    image: "/images/mortarboard.jpg",
    featured: false,
    highlights: ["Six photo stations", "Volunteer photographers", "Digital gallery after the walk"],
    registration: "Limited slots. Sign-up details to be announced.",
    organiser: "Sample: UM Photography Club",
  },
  {
    id: "symphony-recital",
    title: "Convocation Symphony Recital",
    category: "Performances",
    kind: "performance",
    scene: "typographic",
    date: "2026-11-29",
    startTime: "20:00",
    endTime: "21:45",
    venue: "dtc",
    tagline: "Strings, brass and a hall made for sound.",
    description:
      "The university orchestra performs a programme of Malaysian and classical repertoire, closing with a newly commissioned piece for the class of 2026.",
    image: "/images/orchestra.jpg",
    featured: false,
    highlights: ["Commissioned premiere", "Malaysian repertoire", "Seated performance"],
    registration: "Free ticketed entry. Collect tickets at the DTC counter.",
    organiser: "Sample: Cultural Centre",
  },
  {
    id: "archive-of-firsts",
    title: "Archive of Firsts",
    category: "Exhibition",
    kind: "exhibition",
    scene: "exhibition",
    date: "2026-11-30",
    startTime: "09:00",
    endTime: "18:00",
    venue: "library",
    tagline: "Decades of beginnings, on paper.",
    description:
      "An exhibition of convocation programmes, photographs and first editions drawn from the library's collections, tracing how graduation day has looked across the decades.",
    image: "/images/library-stacks.jpg",
    featured: false,
    highlights: ["Archival programmes", "Photographic timeline", "Guided tours on the hour"],
    registration: "Walk-in. Guided tours on the hour.",
    organiser: "Sample: Library Special Collections",
  },
  {
    id: "graduate-showcase",
    title: "Graduate Showcase",
    category: "Exhibition",
    kind: "exhibition",
    scene: "split",
    date: "2026-11-30",
    startTime: "10:00",
    endTime: "19:00",
    venue: "museum",
    tagline: "Final-year work, given the gallery it deserves.",
    description:
      "Design, architecture and fine-art graduates present final-year projects in the museum's white galleries, with makers on hand each afternoon.",
    image: "/images/white-gallery.jpg",
    featured: false,
    highlights: ["Meet-the-maker afternoons", "Architecture models", "Audio guide"],
    registration: "Free entry.",
    organiser: "Sample: Faculty of Creative Arts",
  },
  {
    id: "public-lecture",
    title: "Distinguished Public Lecture",
    category: "Academic",
    kind: "academic",
    scene: "typographic",
    date: "2026-11-30",
    startTime: "15:00",
    endTime: "16:30",
    venue: "theatre",
    tagline: "What a degree is for, in the next decade.",
    description:
      "A distinguished alumnus delivers the festival lecture, followed by a moderated question session with graduates and faculty.",
    image: "/images/keynote-screen.jpg",
    featured: false,
    highlights: ["Keynote lecture", "Moderated Q&A", "Live captioning"],
    registration: "Seats allocated on arrival. Registration link to be announced.",
    organiser: "Sample: Office of the Vice-Chancellor",
  },
  {
    id: "career-fair",
    title: "Graduate Career & Postgraduate Fair",
    category: "Academic",
    kind: "academic",
    scene: "fullbleed",
    date: "2026-12-01",
    startTime: "09:30",
    endTime: "17:00",
    venue: "dtc",
    tagline: "The next step, in one room.",
    description:
      "Employers, scholarship bodies and postgraduate programmes meet graduating students. CV clinics run throughout the day.",
    image: "/images/career-hall.jpg",
    featured: false,
    highlights: ["Employer booths", "CV clinics", "Postgraduate advisers"],
    registration: "Open to graduands and alumni. Bring your student ID.",
    organiser: "Sample: Career Centre",
  },
  {
    id: "badminton-invitational",
    title: "Varsity Badminton Invitational",
    category: "Sports",
    kind: "standard",
    scene: "poster",
    date: "2026-12-01",
    startTime: "14:00",
    endTime: "19:00",
    venue: "sports",
    tagline: "Graduates, staff and alumni. One shuttle.",
    description:
      "A mixed-doubles invitational pairing graduates with alumni and staff, ending in an exhibition final on centre court.",
    image: "/images/badminton.jpg",
    featured: false,
    highlights: ["Mixed doubles draw", "Exhibition final", "Spectator seating"],
    registration: "Team sign-up details to be announced. Spectators walk in.",
    organiser: "Sample: Sports Centre",
  },
  {
    id: "open-studio",
    title: "Open Studio: Paint the Festival",
    category: "Special Activities",
    kind: "special",
    scene: "exhibition",
    date: "2026-12-01",
    startTime: "10:00",
    endTime: "13:00",
    venue: "museum",
    tagline: "Leave your colour on the class of 2026.",
    description:
      "A collaborative mural workshop for families and children. Every visitor adds a stroke to a canvas displayed at the closing night.",
    image: "/images/art-brushes.jpg",
    featured: false,
    highlights: ["All ages", "Materials provided", "Mural shown at closing night"],
    registration: "Walk-in while materials last.",
    organiser: "Sample: Museum Education Team",
  },
  {
    id: "alumni-brunch",
    title: "Alumni Homecoming Brunch",
    category: "Food & Lifestyle",
    kind: "standard",
    scene: "collage",
    date: "2026-12-02",
    startTime: "10:00",
    endTime: "12:30",
    venue: "dataran",
    tagline: "Old friends, new graduates, long tables.",
    description:
      "A relaxed brunch welcoming alumni back to campus to meet the newest graduates, with faculty tables for reconnecting.",
    image: "/images/cafe-interior.jpg",
    featured: false,
    highlights: ["Faculty tables", "Alumni mentors", "Halal menu"],
    registration: "Ticketed. Details to be announced.",
    organiser: "Sample: Alumni Engagement Centre",
  },
  {
    id: "malam-ekspresi",
    title: "Malam Ekspresi",
    category: "Performances",
    kind: "performance",
    scene: "typographic",
    date: "2026-12-02",
    startTime: "20:00",
    endTime: "22:30",
    venue: "theatre",
    tagline: "Student talent, centre stage.",
    description:
      "Dance troupes, poets, choirs and comedians from every faculty compete for the festival trophy in the Experimental Theatre.",
    image: "/images/confetti-stage.jpg",
    featured: false,
    highlights: ["Inter-faculty competition", "Audience vote", "Trophy presentation"],
    registration: "Free entry, limited seats. First come, first seated.",
    organiser: "Sample: Student Affairs",
  },
  {
    id: "colour-carnival",
    title: "Colour Burst Carnival",
    category: "Entertainment",
    kind: "standard",
    scene: "poster",
    date: "2026-12-02",
    startTime: "16:00",
    endTime: "19:00",
    venue: "dataran",
    tagline: "The loudest afternoon of the week.",
    description:
      "Carnival games, colour stations and DJ sets on the plaza. A family afternoon before the evening programme begins.",
    image: "/images/colour-burst.jpg",
    featured: false,
    highlights: ["Carnival games", "DJ sets", "Family zone"],
    registration: "Open to all.",
    organiser: "Sample: Festival Committee",
  },
  {
    id: "fun-run",
    title: "Convo Fun Run 5K",
    category: "Sports",
    kind: "standard",
    scene: "split",
    date: "2026-12-03",
    startTime: "06:30",
    endTime: "09:00",
    venue: "sports",
    tagline: "A last lap around campus.",
    description:
      "A 5 km community run looping through campus, finishing on the Sports Centre track. Finisher medals for every runner.",
    image: "/images/track-start.jpg",
    featured: false,
    highlights: ["5 km campus loop", "Finisher medals", "Family category"],
    registration: "Online registration details to be announced.",
    organiser: "Sample: Sports Centre",
  },
  {
    id: "acoustic-lounge",
    title: "Acoustic Lounge Sessions",
    category: "Entertainment",
    kind: "standard",
    scene: "collage",
    date: "2026-12-03",
    startTime: "17:00",
    endTime: "19:30",
    venue: "library",
    tagline: "Quiet sets between the celebrations.",
    description:
      "Unplugged sets from student musicians in the library foyer: a slower hour before the closing night.",
    image: "/images/neon-lounge.jpg",
    featured: false,
    highlights: ["Unplugged sets", "Foyer seating", "Request board"],
    registration: "Walk-in.",
    organiser: "Sample: Music Society",
  },
  {
    id: "graduation-dinner",
    title: "Graduation Gala Dinner",
    category: "Food & Lifestyle",
    kind: "standard",
    scene: "fullbleed",
    date: "2026-12-03",
    startTime: "19:30",
    endTime: "22:30",
    venue: "dtc",
    tagline: "One long table for the whole class.",
    description:
      "A formal dinner for graduates and families in the hall, with faculty awards presented between courses.",
    image: "/images/banquet-hall.jpg",
    featured: false,
    highlights: ["Formal dinner", "Faculty awards", "Dress code: formal"],
    registration: "Ticketed. Details to be announced.",
    organiser: "Sample: Convocation Secretariat",
  },
  {
    id: "closing-night",
    title: "Closing Night of Lights",
    category: "Special Activities",
    kind: "special",
    scene: "exhibition",
    date: "2026-12-03",
    startTime: "22:30",
    endTime: "23:30",
    venue: "dataran",
    tagline: "Ten thousand sparks for one class.",
    description:
      "The festival closes with a shared sparkler moment on the plaza, the unveiling of the community mural and a farewell message to the class of 2026.",
    image: "/images/sparklers.jpg",
    featured: false,
    highlights: ["Sparkler moment", "Mural unveiling", "Farewell address"],
    registration: "Open to all.",
    organiser: "Sample: Festival Committee",
  },
];

export const eventById = (id: string) => EVENTS.find((e) => e.id === id);

/** Unique festival dates in chronological order. */
export const FESTIVAL_DATES = Array.from(new Set(EVENTS.map((e) => e.date))).sort();

export const byChronology = (a: ConvoEvent, b: ConvoEvent) =>
  a.date === b.date ? a.startTime.localeCompare(b.startTime) : a.date.localeCompare(b.date);
