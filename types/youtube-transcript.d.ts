declare module "youtube-transcript" {
  interface TranscriptResponse {
    text: string;
    duration: number;
    offset: number;
  }

  export function getTranscript(videoId: string): Promise<TranscriptResponse[]>;
}
