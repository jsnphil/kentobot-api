import { z } from 'zod';
import { BumpType } from '../types/song-request';

const bumpRequestSchema = z.object({
  user: z.string(),
  type: z.enum([
    BumpType.Bean,
    BumpType.ChannelPoints,
    BumpType.Bits,
    BumpType.Sub,
    BumpType.GiftedSub,
    BumpType.Raid
  ]),
  position: z.number().optional(),
  modAllowed: z.boolean().optional()
});

const bumpedUserSchema = z.object({
  user: z.string(),
  expiration: z.number(),
  type: z.enum([
    BumpType.Bean,
    BumpType.ChannelPoints,
    BumpType.Bits,
    BumpType.Sub,
    BumpType.GiftedSub,
    BumpType.Raid
  ])
});

const bumpDataSchema = z.object({
  bumpedUsers: z.array(bumpedUserSchema),
  beanBumpsAvailable: z.number(),
  channelPointBumpsAvailable: z.number()
});

type BumpRequest = z.infer<typeof bumpRequestSchema>;
type BumpedUser = z.infer<typeof bumpedUserSchema>;
type BumpData = z.infer<typeof bumpDataSchema>;

export { bumpRequestSchema, type BumpRequest };
export { bumpedUserSchema, type BumpedUser };
export { bumpDataSchema, type BumpData };
