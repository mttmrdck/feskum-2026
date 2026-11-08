import type { ConvoEvent } from "@/data/events";

/** Campus time is MYT (UTC+8, no DST), so conversion to UTC is a fixed offset. */
const MYT_OFFSET_HOURS = 8;

const toUtcStamp = (date: string, time: string, addDays = 0) => {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + addDays, hh - MYT_OFFSET_HOURS, mm));
  return t.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
};

const escapeText = (s: string) =>
  s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

/** Builds a single-event iCalendar file. */
export function buildIcs(event: ConvoEvent, venueName: string, url: string) {
  const crossesMidnight = event.endTime <= event.startTime;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//FESKUM 2026//Convocation Explorer//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${event.id}@feskum-2026`,
    `DTSTAMP:${toUtcStamp(event.date, event.startTime)}`,
    `DTSTART:${toUtcStamp(event.date, event.startTime)}`,
    `DTEND:${toUtcStamp(event.date, event.endTime, crossesMidnight ? 1 : 0)}`,
    `SUMMARY:${escapeText(event.title)}`,
    `LOCATION:${escapeText(`${venueName}, Universiti Malaya`)}`,
    `DESCRIPTION:${escapeText(`${event.tagline}\n\n${event.description}\n\n${url}`)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n");
}

export function downloadIcs(event: ConvoEvent, venueName: string) {
  const url = `${window.location.origin}${window.location.pathname}#event=${event.id}`;
  const blob = new Blob([buildIcs(event, venueName, url)], { type: "text/calendar;charset=utf-8" });
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = `${event.id}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(href), 1000);
}
