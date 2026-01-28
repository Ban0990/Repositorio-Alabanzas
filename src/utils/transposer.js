const SHARPS = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
const FLATS  = ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"];

function normalizeNote(note) {
  // limpia espacios
  return note.trim();
}

function detectScalePref(chord) {
  // Si el acorde tiene b, preferimos FLATS, si tiene # preferimos SHARPS
  if (chord.includes("b")) return "flats";
  if (chord.includes("#")) return "sharps";
  return "sharps";
}

function transposeRoot(root, semitones, pref="sharps") {
  const scale = pref === "flats" ? FLATS : SHARPS;

  // Si root viene en # o b, buscamos en ambas escalas
  let idx = SHARPS.indexOf(root);
  if (idx === -1) idx = FLATS.indexOf(root);
  if (idx === -1) return root; // si no reconoce, lo devuelve igual

  const newIndex = (idx + semitones) % 12;
  const fixedIndex = newIndex < 0 ? newIndex + 12 : newIndex;

  return scale[fixedIndex];
}

// Extrae raíz tipo: C, C#, Db
function parseChord(chord) {
  const c = chord.trim();

  // raíz = letra A-G + opcional # o b
  const match = c.match(/^([A-G])([#b]?)(.*)$/);
  if (!match) return null;

  const root = match[1] + (match[2] || "");
  const rest = match[3] || ""; // m, maj7, sus4, /B, etc.

  return { root, rest };
}

export function transposeChord(chord, semitones) {
  if (typeof chord !== "string") return chord;

  // soporta slash chords: D/F#
  const parts = chord.split("/");
  const main = parts[0];
  const bass = parts[1];

  const parsedMain = parseChord(main);
  if (!parsedMain) return chord;

  const pref = detectScalePref(chord);
  const newRoot = transposeRoot(normalizeNote(parsedMain.root), semitones, pref);

  let result = newRoot + parsedMain.rest;

  if (bass) {
    const parsedBass = parseChord(bass);
    if (parsedBass) {
      const newBass = transposeRoot(normalizeNote(parsedBass.root), semitones, pref);
      result += "/" + newBass + parsedBass.rest;
    } else {
      result += "/" + bass;
    }
  }

  return result;
}

export function transposeContenido(contenido, semitones) {
  // contenido puede ser objeto o array. Ej:
  // { intro: ["G", "D/F#", "Em", "C"], verso: [...] }
  if (Array.isArray(contenido)) {
    return contenido.map((x) => transposeContenido(x, semitones));
  }

  if (contenido && typeof contenido === "object") {
    const out = {};
    for (const k of Object.keys(contenido)) {
      out[k] = transposeContenido(contenido[k], semitones);
    }
    return out;
  }

  if (typeof contenido === "string") {
    return transposeChord(contenido, semitones);
  }

  return contenido;
}