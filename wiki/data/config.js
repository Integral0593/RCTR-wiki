/* ============================================================
   SITE CONFIG — edit me first.
   Change the wiki name, tagline, and which categories exist.
   ============================================================ */
window.SITE = {
  name: "Aethel",                       // your world's name
  brandSuffix: "Codex",                 // shown after the name in the header
  tagline: "An archive of the world, its people, and the ages between.",
  footer: "Aethel Codex · built by [your name] · fan-content welcome",

  // Categories. `id` must match the "category" field in your entries.
  // `data` points to the JSON file under /data/.
  categories: [
    { id: "characters", label: "Characters", icon: "characters.json",
      blurb: "The people who walk the world.", data: "characters.json" },
    { id: "places",     label: "World",       icon: "places.json",
      blurb: "Lands, cities, and the maps between them.", data: "places.json" },
    { id: "lore",       label: "Lore",        icon: "lore.json",
      blurb: "Magic, factions, and the rules of reality.", data: "lore.json" },
    { id: "timeline",   label: "Timeline",    icon: "timeline.json",
      blurb: "Ages and events, in order.", data: "timeline.json", isTimeline: true }
  ]
};
