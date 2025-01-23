import { z } from 'zod';

const isoDateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/, {
    message: 'Invalid played date'
  });

export const SongRequestSchema = z.object({
  youtubeId: z.string(),
  title: z.string(),
  length: z.number(),
  played: isoDateString,
  requestedBy: z.string()
});

export const WebSocketMessageSchema = z.object({
  action: z.string(),
  message: z.string()
});

export const RequestSongSchema = z.object({
  youtubeId: z.string(),
  requestedBy: z.string(),
  modOverride: z.boolean().optional()
});

export const MoveSongRequestSchema = z.object({
  position: z.number()
});
