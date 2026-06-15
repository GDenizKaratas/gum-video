// Converts digits, currency symbols and a few abbreviations in a narration to
// their Turkish SPOKEN form, so ElevenLabs reads them correctly. The on-screen
// text (scene stat/list values) keeps the digits — only the TTS input is
// transformed. Captions (built from the spoken audio) will show the spoken form.

const ONES = ["", "bir", "iki", "üç", "dört", "beş", "altı", "yedi", "sekiz", "dokuz"];
const TENS = ["", "on", "yirmi", "otuz", "kırk", "elli", "altmış", "yetmiş", "seksen", "doksan"];

function under1000(n: number): string {
  let r = "";
  const h = Math.floor(n / 100);
  const t = Math.floor((n % 100) / 10);
  const o = n % 10;
  if (h) r += (h === 1 ? "" : ONES[h] + " ") + "yüz ";
  if (t) r += TENS[t] + " ";
  if (o) r += ONES[o] + " ";
  return r.trim();
}

export function intToTurkish(n: number): string {
  if (n === 0) return "sıfır";
  let r = "";
  const milyar = Math.floor(n / 1_000_000_000);
  const milyon = Math.floor((n % 1_000_000_000) / 1_000_000);
  const bin = Math.floor((n % 1_000_000) / 1000);
  const kalan = n % 1000;
  if (milyar) r += under1000(milyar) + " milyar ";
  if (milyon) r += (milyon === 1 ? "" : under1000(milyon) + " ") + "milyon ";
  if (bin) r += (bin === 1 ? "" : under1000(bin) + " ") + "bin ";
  if (kalan) r += under1000(kalan) + " ";
  return r.replace(/\s+/g, " ").trim();
}

export function toSpokenTr(text: string): string {
  let t = text
    .replace(/₺/g, " lira")
    .replace(/€/g, " euro")
    .replace(/\$/g, " dolar")
    .replace(/%\s?/g, "yüzde ");

  // Number tokens (digits, with optional "." thousand separators in Turkish)
  t = t.replace(/\d[\d.]*/g, (m) => {
    const digits = m.replace(/\./g, "");
    if (!/^\d+$/.test(digits) || digits.length > 12) return m;
    return intToTurkish(parseInt(digits, 10));
  });

  return t.replace(/[ \t]+/g, " ").trim();
}
