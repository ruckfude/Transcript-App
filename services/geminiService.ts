
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { TranscriptionResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const transcribeAudio = async (
  audioBase64: string, 
  mimeType: string,
  onProgress: (status: string) => void
): Promise<TranscriptionResponse> => {
  onProgress("Initializing AI analysis...");

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      {
        parts: [
          {
            inlineData: {
              data: audioBase64,
              mimeType: mimeType
            }
          },
          {
            text: `Transcribe this podcast audio. 
            Include:
            1. A clear title for the episode.
            2. A brief 2-3 sentence summary.
            3. Chapter markers (timestamp and title).
            4. Full transcript with speaker labels and timestamps in [MM:SS] format.
            
            Identify unique speakers and label them (e.g., Speaker A, Speaker B).
            Return the result ONLY as a valid JSON object matching this structure:
            {
              "metadata": {
                "title": "string",
                "summary": "string",
                "chapters": [{ "time": "string", "title": "string" }],
                "speakers": ["string"]
              },
              "transcript": [{ "timestamp": "string", "speaker": "string", "text": "string" }]
            }`
          }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          metadata: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
              chapters: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    time: { type: Type.STRING },
                    title: { type: Type.STRING }
                  },
                  required: ["time", "title"]
                }
              },
              speakers: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["title", "summary", "chapters", "speakers"]
          },
          transcript: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                timestamp: { type: Type.STRING },
                speaker: { type: Type.STRING },
                text: { type: Type.STRING }
              },
              required: ["timestamp", "speaker", "text"]
            }
          }
        },
        required: ["metadata", "transcript"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI model.");
  
  try {
    return JSON.parse(text) as TranscriptionResponse;
  } catch (err) {
    console.error("JSON Parse Error:", text);
    throw new Error("Failed to parse transcription data.");
  }
};
