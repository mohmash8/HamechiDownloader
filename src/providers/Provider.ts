export type ProcessResult =
  | { mode: 'metadata', title: string, originalUrl: string }
  | { mode: 'file', filename: string, stream: NodeJS.ReadableStream, sizeBytes?: number, mime?: string };

export interface Provider {
  match(url: string): boolean;
  process(url: string): Promise<ProcessResult>;
}
