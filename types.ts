
export interface TranscriptSegment {
  timestamp: string;
  speaker: string;
  text: string;
}

export interface PodcastMetadata {
  title: string;
  summary: string;
  chapters: Array<{ time: string; title: string }>;
  speakers: string[];
}

export interface TranscriptionResponse {
  metadata: PodcastMetadata;
  transcript: TranscriptSegment[];
}

export enum AppStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  TRANSCRIBING = 'TRANSCRIBING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}
