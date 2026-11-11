import { expect } from "vitest"

import type { Prisma } from "@/src/generated/prisma/client"
import { db } from "@/src/server/db"

export type Tx = Prisma.TransactionClient

class Rollback extends Error {}

/**
 * Runs `fn` inside a transaction that is always rolled back,
 * so tests never leave rows behind in the database.
 */
export async function inRolledBackTransaction(fn: (tx: Tx) => Promise<void>) {
  await expect(
    db.$transaction(
      async (tx) => {
        await fn(tx)
        throw new Rollback()
      },
      { timeout: 20_000, maxWait: 10_000 }
    )
  ).rejects.toBeInstanceOf(Rollback)
}
