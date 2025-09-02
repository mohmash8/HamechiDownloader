import type { Readable } from 'stream';
export type ProcessResult =
  | { mode: 'metadata', title: string, originalUrl: string }
  | { mode: 'file', filename: string, stream: Readable, sizeBytes?: number, mime?: string };

export interface Provider {
  match(url: string): boolean;
  process(url: string): Promise<ProcessResult>;
}
