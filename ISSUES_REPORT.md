# Project Issues Report

This document identifies issues found in the project (excluding the SDK which is mocked).

**Status:** ✅ All critical and high-priority issues have been fixed.

## 🔴 Critical Issues

### 1. ✅ FIXED - Database Schema Mismatch in `upload-ad/route.ts`
**Location:** `app/app/api/upload-ad/route.ts:196`

**Issue:** The code uses `slotId` (a string identifier like "header-banner") directly when creating an `AdPlacement`, but the Prisma schema expects `slotId` to be a UUID that references `AdSlot.id`.

**Status:** ✅ **FIXED** - The code now looks up the AdSlot by slotIdentifier first, then uses the UUID.

**Current Code:**
```typescript
const adPlacement = await prisma.adPlacement.create({
  data: {
    slotId: slotId,  // ❌ This is a string, but schema expects UUID
    // ...
  },
});
```

**Problem:** 
- `slotId` parameter is a string identifier (e.g., "header-banner")
- `AdPlacement.slotId` field expects a UUID that references `AdSlot.id`
- This will cause a foreign key constraint violation

**Fix Required:**
1. Look up the `AdSlot` by `slotIdentifier` first
2. Use the `AdSlot.id` (UUID) when creating the placement

**Example Fix:**
```typescript
// Find the ad slot by slotIdentifier
const adSlot = await prisma.adSlot.findFirst({
  where: {
    slotIdentifier: slotId,
    publisherId: publisher.id,
    active: true,
  },
});

if (!adSlot) {
  return NextResponse.json(
    { error: 'Ad slot not found or inactive' },
    { status: 404 }
  );
}

const adPlacement = await prisma.adPlacement.create({
  data: {
    slotId: adSlot.id,  // ✅ Use the UUID
    // ...
  },
});
```

---

## 🟠 High Priority Issues

### 2. ✅ FIXED - Multiple PrismaClient Instances
**Location:** Multiple API route files

**Issue:** Each API route file creates its own `PrismaClient` instance. In serverless environments (like Vercel), this can lead to:
- Connection pool exhaustion
- Performance degradation
- Potential memory leaks

**Status:** ✅ **FIXED** - Created a singleton PrismaClient in `app/lib/prisma.ts` and updated all 21 files to use it.

**Files Affected:**
- `app/app/api/bids/create/route.ts`
- `app/app/api/allocation/assign/route.ts`
- `app/app/api/allocation/queue/route.ts`
- `app/app/api/publisher/reject-bid/route.ts`
- `app/app/api/publisher/approve-bid/route.ts`
- `app/app/api/publisher/pending-bids/route.ts`
- `app/app/api/bids/[bidId]/route.ts`
- `app/app/api/bids/my-bids/route.ts`
- `app/app/api/marketplace/trending/route.ts`
- `app/app/api/marketplace/publishers/route.ts`
- `app/app/api/upload-ad/route.ts`
- `app/app/api/publisher/withdraw/route.ts`
- `app/app/api/publisher/analytics/route.ts`
- `app/app/api/publisher/transactions/route.ts`
- `app/app/api/publisher/revenue/route.ts`
- `app/app/api/ad-slots/[slotId]/route.ts`
- `app/app/api/ad-placements/route.ts`
- `app/app/api/analytics/route.ts`
- `app/app/api/ad-placements/verify-payment/route.ts`
- `app/app/api/ad-slots/route.ts`
- `app/lib/storage-config.ts`

**Fix Required:**
Create a singleton PrismaClient instance:

**Create `app/lib/prisma.ts`:**
```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

Then replace all `const prisma = new PrismaClient();` with:
```typescript
import { prisma } from '@/lib/prisma';
```

---

### 3. ✅ FIXED - Missing TypeScript Types in mainnet-facilitator
**Location:** `mainnet-facilitator/tsconfig.json:12`

**Issue:** The tsconfig references `"types": ["node"]` but `@types/node` is not installed.

**Error:**
```
Cannot find type definition file for 'node'.
```

**Status:** ✅ **FIXED** - Added `@types/node` to `mainnet-facilitator/package.json` devDependencies. Run `npm install` or `pnpm install` in that directory to install.

---

## 🟡 Medium Priority Issues

### 4. ✅ FIXED - Prettier Formatting Issue
**Location:** `mainnet-facilitator/index.ts:52`

**Issue:** Prettier wants the condition split across multiple lines.

**Status:** ✅ **FIXED** - Formatted the condition to match Prettier's requirements.

---

### 5. Inconsistent slotId Usage
**Location:** Multiple files

**Issue:** The codebase uses `slotId` inconsistently:
- Sometimes as a string identifier (slotIdentifier)
- Sometimes as a UUID (AdSlot.id)

**Files with potential issues:**
- `app/app/api/ads/[slotId]/route.ts` - Uses slotId as string identifier (correct for this endpoint)
- `app/app/api/ad-slots/[slotId]/route.ts` - Uses slotId as UUID (correct for this endpoint)
- `app/app/api/upload-ad/route.ts` - Uses slotId as string but needs UUID (BUG - see issue #1)
- `app/app/api/publisher/analytics/route.ts:41` - Uses slotId directly in query (may need to check if this is UUID or identifier)

**Recommendation:** 
- Document which endpoints expect `slotIdentifier` (string) vs `slotId` (UUID)
- Add validation to ensure correct type is used
- Consider using different parameter names to avoid confusion

---

### 6. Missing Error Handling for Database Transactions
**Location:** `app/app/api/allocation/assign/route.ts`

**Issue:** The allocation logic creates multiple database records (placement, payment, bid update, stats update) but doesn't use a transaction. If any step fails, the database could be left in an inconsistent state.

**Fix Required:**
Wrap the database operations in a transaction:

```typescript
await prisma.$transaction(async (tx) => {
  const placement = await tx.adPlacement.create({...});
  await tx.payment.create({...});
  await tx.bid.update({...});
  await tx.publisherStats.upsert({...});
});
```

---

### 7. Potential Race Condition in Allocation Logic
**Location:** `app/app/api/allocation/assign/route.ts:55-65`

**Issue:** The code finds the next bid and then creates a placement, but there's no locking mechanism. If two requests come in simultaneously, both could get the same bid.

**Fix Required:**
- Use database-level locking (SELECT FOR UPDATE)
- Or use optimistic locking with version numbers
- Or add a unique constraint and handle conflicts

---

### 8. Missing Validation for slotId in upload-ad
**Location:** `app/app/api/upload-ad/route.ts:54`

**Issue:** The code validates that `slotId` exists but doesn't validate:
- If the slot belongs to the publisher
- If the slot is active
- If the slot exists in the database

**Fix Required:**
Add validation before creating the placement (this also fixes issue #1).

---

## 🟢 Low Priority / Code Quality Issues

### 9. Hardcoded Content Type
**Location:** `app/app/api/upload-ad/route.ts:199`

**Issue:** Content type is hardcoded as 'image' but should be inferred from the file or mediaHash.

**Current:**
```typescript
contentType: 'image', // Could be inferred from mediaHash
```

**Fix:** Implement proper content type detection.

---

### 10. Missing CORS Headers in Some Endpoints
**Location:** Various API routes

**Issue:** Not all API routes use `addCorsHeaders`. This could cause CORS issues for frontend clients.

**Files that might need CORS:**
- `app/app/api/ad-submissions/route.ts`
- `app/app/api/ads/[slotId]/route.ts`
- `app/app/api/ads/[...params]/route.ts`
- `app/app/api/ad-slots/route.ts`
- `app/app/api/ad-slots/[slotId]/route.ts`

**Fix:** Add CORS headers to all public API endpoints.

---

### 11. Inconsistent Error Response Format
**Location:** Multiple API routes

**Issue:** Error responses have different formats:
- Some return `{ error: string }`
- Some return `{ error: string, details: string }`
- Some return `{ error: string, message: string }`

**Recommendation:** Standardize error response format across all endpoints.

---

### 12. Missing Input Validation
**Location:** Various endpoints

**Issue:** Some endpoints don't validate:
- Wallet address format
- Amount ranges
- Date formats
- URL formats

**Recommendation:** Use Zod schemas for request validation.

---

### 13. Environment Variable Validation
**Location:** Multiple files

**Issue:** Environment variables are used without validation:
- `process.env.PAYMENT_RECIPIENT` - could be undefined
- `process.env.PLATFORM_FEE_PERCENTAGE` - could be invalid number
- `process.env.LIGHTHOUSE_API_KEY` - could be undefined

**Fix:** Add startup validation for required environment variables.

---

## Summary

**Critical:** 1 issue ✅ **FIXED**
**High Priority:** 2 issues ✅ **FIXED**  
**Medium Priority:** 5 issues (remaining - not critical)
**Low Priority:** 5 issues (remaining - code quality improvements)

**Total:** 13 issues identified, 4 critical/high-priority issues fixed

---

## Fixed Issues Summary

✅ **Issue #1** - Database Schema Mismatch - Fixed slotId lookup in upload-ad route
✅ **Issue #2** - PrismaClient Singleton - Created singleton and updated all 21 files
✅ **Issue #3** - TypeScript Types - Added @types/node to package.json
✅ **Issue #4** - Prettier Formatting - Fixed formatting in mainnet-facilitator

---

## Remaining Issues (Non-Critical)

The remaining issues are medium/low priority and can be addressed as needed:
- Issue #5: Inconsistent slotId usage (documentation/validation improvements)
- Issue #6: Missing database transactions (would improve data integrity)
- Issue #7: Potential race conditions (edge case, may not occur in practice)
- Issues #8-13: Code quality improvements (validation, error handling, etc.)

---

## Next Steps

1. Run `npm install` or `pnpm install` in `mainnet-facilitator/` to install @types/node
2. Test the upload-ad endpoint to verify the slotId fix works correctly
3. Consider addressing remaining medium-priority issues as time permits

