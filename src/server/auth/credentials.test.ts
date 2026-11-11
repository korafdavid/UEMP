import { afterAll, describe, expect, it } from "vitest"

import { authenticate } from "@/src/server/auth/credentials"
import { db } from "@/src/server/db"
import { hashPassword } from "@/src/server/password"
import { inRolledBackTransaction } from "@/test/db"

const password = "correct horse battery staple"

afterAll(async () => {
  await db.$disconnect()
})

describe("authenticate", () => {
  it("accepts the correct password", async () => {
    await inRolledBackTransaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: "login.ok@example.com",
          firstName: "Ada",
          lastName: "Obi",
          role: "STUDENT",
          passwordHash: await hashPassword(password),
        },
      })

      await expect(authenticate("login.ok@example.com", password, tx)).resolves.toEqual({
        ok: true,
        userId: user.id,
      })
    })
  })

  it("rejects a wrong password", async () => {
    await inRolledBackTransaction(async (tx) => {
      await tx.user.create({
        data: {
          email: "login.wrong@example.com",
          firstName: "Ada",
          lastName: "Obi",
          role: "STUDENT",
          passwordHash: await hashPassword(password),
        },
      })

      await expect(authenticate("login.wrong@example.com", "nope", tx)).resolves.toEqual({
        ok: false,
        reason: "invalid",
      })
    })
  })

  it("rejects an unknown email with the same result as a wrong password", async () => {
    await inRolledBackTransaction(async (tx) => {
      await expect(authenticate("nobody@example.com", password, tx)).resolves.toEqual({
        ok: false,
        reason: "invalid",
      })
    })
  })

  it("rejects a deactivated user only after the correct password", async () => {
    await inRolledBackTransaction(async (tx) => {
      await tx.user.create({
        data: {
          email: "login.inactive@example.com",
          firstName: "Ada",
          lastName: "Obi",
          role: "LECTURER",
          isActive: false,
          passwordHash: await hashPassword(password),
        },
      })

      await expect(authenticate("login.inactive@example.com", "nope", tx)).resolves.toEqual({
        ok: false,
        reason: "invalid",
      })
      await expect(authenticate("login.inactive@example.com", password, tx)).resolves.toEqual({
        ok: false,
        reason: "inactive",
      })
    })
  })
})
