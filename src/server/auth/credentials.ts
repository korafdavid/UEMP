import "server-only"

import { db } from "@/src/server/db"
import { hashPassword, verifyPassword } from "@/src/server/password"

/** The one query this module needs, so `db` or a transaction client both fit. */
type Client = {
  user: {
    findUnique(args: {
      where: { email: string }
      select: { id: true; isActive: true; passwordHash: true }
    }): PromiseLike<{ id: string; isActive: boolean; passwordHash: string } | null>
  }
}

export type AuthResult =
  | { ok: true; userId: string }
  | { ok: false; reason: "invalid" | "inactive" }

// Used when no user matches, so a missing account takes as long to reject
// as a wrong password and can't be detected by timing.
let dummyHash: Promise<string> | undefined

export async function authenticate(
  email: string,
  password: string,
  client: Client = db
): Promise<AuthResult> {
  const user = await client.user.findUnique({
    where: { email },
    select: { id: true, isActive: true, passwordHash: true },
  })

  if (!user) {
    dummyHash ??= hashPassword("timing-equalizer")
    await verifyPassword(password, await dummyHash)
    return { ok: false, reason: "invalid" }
  }

  if (!(await verifyPassword(password, user.passwordHash))) {
    return { ok: false, reason: "invalid" }
  }

  // Only reveal deactivation after the correct password was supplied.
  if (!user.isActive) {
    return { ok: false, reason: "inactive" }
  }

  return { ok: true, userId: user.id }
}
