import fs from "fs";
import { ELEVENLABS_MODEL } from "../config";

export type ElevenLabsAlignment = {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
};

export type ElevenLabsResponse = {
  audio_base64: string;
  alignment: ElevenLabsAlignment;
  normalized_alignment: ElevenLabsAlignment;
};

export async function generateSpeechWithTimestamps(
  text: string,
  voiceId: string,
  outPath: string,
): Promise<ElevenLabsAlignment> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ELEVENLABS_API_KEY ortam değişkeni eksik. .env dosyasına ekleyin.",
    );
  }

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: ELEVENLABS_MODEL,
        voice_settings: {
          speed: 0.92,
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.3,
          use_speaker_boost: true,
        },
      }),
    },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`ElevenLabs API hatası ${response.status}: ${body}`);
  }

  const data = (await response.json()) as ElevenLabsResponse;

  const audioBuffer = Buffer.from(data.audio_base64, "base64");
  fs.writeFileSync(outPath, audioBuffer);

  return data.alignment;
}
