import { Router } from 'express';
import { z } from 'zod';
import { getDb, COLLECTION_NAME } from '../firebase.js';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { HashRecord, hashRecordSchema, getSchema } from '../types.js';

export const hashRouter = Router();

/**
 * POST /hashes
 * Body: { index, media_hash, validUpto, txHash, AmountPaid, payerAddress, recieverAddress }
 * Stores the record under the doc id equal to "index".
 * Note: validUpto is user-specified Unix timestamp for ad expiration.
 */
hashRouter.post('/', async (req, res) => {
  try {
    const parsed = hashRecordSchema.parse(req.body);
    const db = getDb();
    const docRef = doc(db, COLLECTION_NAME, parsed.index);
    await setDoc(docRef, parsed as HashRecord, { merge: false });

    res.status(201).json({ ok: true, id: parsed.index });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid payload', details: err.format() });
    }
    return res.status(500).json({ error: 'Failed to store record' });
  }
});

/**
 * GET /hashes/:index
 * Retrieves the record stored under the provided index.
 */
hashRouter.get('/:index', async (req, res) => {
  try {
    const params = getSchema.parse({ index: req.params.index });
    const db = getDb();
    const docRef = doc(db, COLLECTION_NAME, params.index);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      return res.status(404).json({ error: 'Not found' });
    }
    return res.status(200).json(snap.data());
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid index', details: err.format() });
    }
    return res.status(500).json({ error: 'Failed to retrieve record' });
  }
});

/**
 * Optional: GET /hashes?index=<index> to support query-based retrieval
 */
hashRouter.get('/', async (req, res) => {
  try {
    const indexParam = (req.query.index as string | undefined) ?? '';
    if (!indexParam) {
      return res.status(400).json({ error: 'index query parameter is required' });
    }
    const params = getSchema.parse({ index: indexParam });
    const db = getDb();
    const docRef = doc(db, COLLECTION_NAME, params.index);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      return res.status(404).json({ error: 'Not found' });
    }
    return res.status(200).json(snap.data());
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid index', details: err.format() });
    }
    return res.status(500).json({ error: 'Failed to retrieve record' });
  }
});


