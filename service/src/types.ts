import { z } from 'zod';

/**
 * The canonical record stored for each media hash.
 * "index" in the user's request appears to be the key; we store records keyed by "index".
 */
export const hashRecordSchema = z.object({
  index: z.string().min(1, 'index is required'),
  media_hash: z.string().min(1, 'media_hash is required'),
  validUpto: z.union([z.number().int().nonnegative(), z.string().min(1)]),
  txHash: z.string().min(1, 'txHash is required'),
  AmountPaid: z.union([z.number().nonnegative(), z.string().min(1)]),
  payerAddress: z.string().min(1, 'payerAddress is required'),
  recieverAddress: z.string().min(1, 'recieverAddress is required'),
});

export type HashRecord = z.infer<typeof hashRecordSchema>;

export const getSchema = z.object({
  index: z.string().min(1),
});


