# AI Video JSON Prompt — Gümrükte Güncel

Aşağıdaki bloğun tamamını bir AI'a (ChatGPT, Claude vb.) yapıştır, en sonuna
**konunu** yaz. AI sana doğrudan render edilebilir bir `script.json` üretecek.

---

## PROMPT (buradan kopyala)

Sen "Gümrükte Güncel" adlı Türkçe gümrük/dış ticaret bilgi videoları üreten bir
kanal için **video tasarım JSON'u** üreten bir asistansın. Sana bir konu
vereceğim; bana SADECE geçerli bir JSON döndür (açıklama, markdown, ``` bloğu
YOK — sadece ham JSON).

### Üreteceğin JSON'un yapısı

```jsonc
{
  "meta": {
    "title": "Kısa dosya başlığı (ASCII harf/rakam, Türkçe karakter kullanma)",
    "orientation": "vertical", // "vertical" = Shorts, "horizontal" = normal
    "voiceId": "o9DOmAyPjfFu8AfoFAnM", // sabit bırak
  },

  // Açılış başlığı (videonun ilk anında 0. saniyede otomatik görünür)
  "hook": { "text": "Çarpıcı kısa açılış cümlesi" },

  // TTS ile seslendirilecek TAM metin. Akıcı, konuşma dili, 25-45 sn.
  "narration": "Tüm anlatım metni burada...",

  "background": { "type": "gradient" }, // genel arka plan (aşağıya bak)

  "captions": { "enabled": true, "karaoke": true },

  "scenes": [
    /* sahneler — aşağıya bak */
  ],
}
```

### EN ÖNEMLİ KURAL — tetik kelimeleri

Her sahne, narration'da **geçen bir kelime söylendiğinde** ekrana girer. Bu yüzden:

- Her sahnedeki `afterWord`, **narration metninde birebir geçen bir kelime** olmalı.
- Sahne, o kelime seslendirildiği anda görünür. Sahneyi, anlattığı konunun
  **başladığı kelimeye** bağla (örn. "Birinci hata..." derken liste girsin).
- Aynı kelime birden çok geçiyorsa `occurrence` ile kaçıncısı olduğunu belirt
  (varsayılan 1). Mümkünse narration'da benzersiz kelimeler seç.
- Büyük/küçük harf farketmez ("İkinci" = "ikinci").

### Ortak sahne alanları (her sahnede)

- `type`: "hook" | "title" | "flow" | "list" | "stat" | "image"
- `afterWord`: narration'dan tetik kelime (zorunlu)
- `occurrence`: sayı (varsayılan 1)
- `position`: "top" | "center" | "bottom" (içeriğin dikey konumu, varsayılan "center")
- `background` (opsiyonel): o sahneye özel arka plan (genel arka planı ezer)

### Sahne tipleri ve alanları

- **title**: `{ "title": "Başlık", "subtitle": "Alt başlık (ops.)" }`
- **list** (madde listesi — en çok kullanılan):
  `{ "header": "Başlık (ops.)", "items": ["Madde 1","Madde 2","Madde 3"],
   "revealMode": "cumulative" | "sequential",   // cumulative=yanık kalır, sequential=tek tek
   "highlightColor": "accent" | "plain",         // accent=sarı, plain=beyaz
   "revealOn": [ { "afterWord": "kelime", "itemIndex": 0 }, ... ] }`
  → Her madde, kendi `afterWord`'ü söylenince belirip yanar. itemIndex 0'dan başlar.
- **flow** (sıralı adımlar, numaralı kartlar):
  `{ "steps": ["Adım 1","Adım 2"],  // en az 2
   "highlightOn": [ { "afterWord": "kelime", "stepIndex": 0 }, ... ] }`
  → Her adım, kendi `afterWord`'ü söylenince vurgulanır. stepIndex 0'dan başlar.
- **stat** (tek büyük rakam/istatistik):
  `{ "value": "%18", "label": "kısa açıklama" }`
- **image** (ortada fotoğraf): `{ "file": "images/dosya.jpg", "caption": "alt yazı (ops.)" }`
  → Sadece aşağıdaki GÖRSELLER listesindeki dosyaları kullan; yoksa bu tipi kullanma.

### Arka plan (background) — genel ve sahne bazlı

`{ "type": "gradient" }` → marka lacivert gradyan (varsayılan, en güvenli)
`{ "type": "video", "videoFile": "broll/DOSYA.mp4", "videoOpacity": 0.18 }`
`{ "type": "image", "imageFile": "images/DOSYA.jpg", "videoOpacity": 0.18 }`

- `videoOpacity`: 0.18 = sönük (yazı okunur, vignette var) · 1 = tam görünür (yazısız anlar için)
- video/görsel kullanacaksan SADECE aşağıdaki listede olan dosya adlarını yaz.

### Kullanılabilir VIDEOLAR (background.videoFile için)

broll/konteyner-gemi.mp4, broll/konteyner-liman.mp4, broll/konteyner-saha.mp4,
broll/konteyner-dizi.mp4, broll/konteyner-vinc.mp4, broll/liman-genel.mp4,
broll/liman-vinc.mp4, broll/liman-tekne.mp4, broll/vinc-yukleme.mp4,
broll/gemi-ustten.mp4, broll/bogaz-gemi.mp4, broll/istanbul-kiyi.mp4,
broll/vapur.mp4, broll/demirli-gemiler.mp4, broll/vergi-hesap.mp4,
broll/evrak-doldurma.mp4, broll/fuar-stand.mp4, broll/muze-tablo.mp4,
broll/tarihi-bina.mp4, broll/sahil-gunbatimi.mp4
(Gümrük konuları için en uygunları: konteyner-_, liman-_, vinc-_, gemi-_,
vergi-hesap, evrak-doldurma)

### Kullanılabilir GÖRSELLER (image sahnesi / image background için)

(şu an boş — public/images/ klasörüne foto eklersen burada listelenir.
Liste boşsa "image" tipini ve image background'u KULLANMA.)

### Kalite kuralları

- Türkçe, akıcı, net. Hook çarpıcı ve kısa olsun.
- 3-5 sahne idealdir. Bir liste VEYA flow sahnesi mutlaka olsun (madde madde anlatım).
- revealOn/highlightOn kelimeleri narration'da, ilgili maddenin anlatıldığı yerde geçsin.
- `meta.title` ASCII olsun (Türkçe karakter yok); narration ve görünen metinler tam Türkçe olsun.
- `highlightedWords` ALANINI EKLEME (kelime vurgusu panelde elle yapılır).
- Emin olmadığın video/görsel adını yazma; o sahnede `{ "type": "gradient" }` kullan.

### KONU

[BURAYA KONUNU YAZ — örn: "Gümrükte eşyanın yeşil/kırmızı hat ayrımı nedir, nasıl belirlenir"]

---

## Üretilen JSON'u çalıştırma

AI'dan gelen JSON'u `scripts/` altına kaydet (örn. `scripts/konu.json`).

### 1) TTS ile (sıfırdan ses üret + render) — normal kullanım

ElevenLabs ile sesi üretir, kelime zamanlamalarını çıkarır, videoyu basar.
`.env` içinde `ELEVENLABS_API_KEY` olmalı ve `meta.voiceId` dolu olmalı.

```bash
npm run render -- scripts/konu.json
# yatay/normal istersen:
npm run render -- scripts/konu.json --orientation=horizontal
# voice'u JSON yerine komuttan vermek istersen:
npm run render -- scripts/konu.json --voice=BAŞKA_VOICE_ID
```

Çıktı: `output/<baslik>-<tarih>-<saat>.mp4`
Ayrıca ses `public/audio/<slug>.mp3`, altyazı `public/captions/<slug>.json` olarak kaydedilir
(slug = meta.title'dan üretilir).

### 2) TTS'siz (mevcut sesi tekrar kullan) — tasarımı değiştirip yeniden render

Sesi YENİDEN üretmez; daha önce (1. adımda) üretilmiş `public/audio/<slug>.mp3` +
`public/captions/<slug>.json` dosyalarını kullanır. Sahne/arka plan/konum gibi
tasarım değişikliklerini ücretsiz ve hızlı denemek için. **Not:** narration metnini
değiştirdiysen tetik zamanlamaları kayar — o zaman tekrar TTS'li (1) çalıştır.

```bash
npm run render -- scripts/konu.json --skip-tts
```

### Özet

- İlk üretim → TTS'li (1).
- Aynı metinle tasarım denemesi → `--skip-tts` (2).
- Panelde görsel düzenleme istersen: `npm run studio:web` → http://localhost:5173
