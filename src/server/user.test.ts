import { afterAll, describe, expect, it } from "vitest"

import { Prisma } from "@/src/generated/prisma/client"
import { db } from "@/src/server/db"

type Tx = Prisma.TransactionClient

class Rollback extends Error {}

/**
 * Runs `fn` inside a transaction that is always rolled back,
 * so tests never leave rows behind in the database.
 */
async function inRolledBackTransaction(fn: (tx: Tx) => Promise<void>) {
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

const validUser = {
  email: "new.student@example.com",
  firstName: "Ada",
  lastName: "Obi",
  passwordHash: "$argon2id$v=19$m=65536,t=3,p=4$placeholder",
  role: "STUDENT",
} satisfies Prisma.UserCreateInput

afterAll(async () => {
  await db.$disconnect()
})

describe("creating a user", () => {
  it("creates a user with generated id, defaults and timestamps", async () => {
    await inRolledBackTransaction(async (tx) => {
      const user = await tx.user.create({ data: validUser })

      expect(user.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
      )
      expect(user).toMatchObject({
        email: validUser.email,
        firstName: "Ada",
        lastName: "Obi",
        role: "STUDENT",
        isActive: true,
      })
      expect(user.createdAt).toBeInstanceOf(Date)
      expect(user.updatedAt).toBeInstanceOf(Date)
    })
  })

  it("does not return passwordHash by default", async () => {
    await inRolledBackTransaction(async (tx) => {
      const created = await tx.user.create({ data: validUser })
      expect(created).not.toHaveProperty("passwordHash")

      const found = await tx.user.findUnique({ where: { id: created.id } })
      expect(found).not.toHaveProperty("passwordHash")

      // Auth code can opt in explicitly when verifying a password.
      const withHash = await tx.user.findUnique({
        where: { id: created.id },
        omit: { passwordHash: false },
      })
      expect(withHash?.passwordHash).toBe(validUser.passwordHash)
    })
  })

  it("rejects an email that differs only by case", async () => {
    await inRolledBackTransaction(async (tx) => {
      await tx.user.create({
        data: { ...validUser, email: "Student@example.com" },
      })

      const duplicate = tx.user.create({
        data: { ...validUser, email: "student@example.com" },
      })

      await expect(duplicate).rejects.toBeInstanceOf(
        Prisma.PrismaClientKnownRequestError
      )
      await expect(duplicate).rejects.toMatchObject({ code: "P2002" })
    })
  })

  it("requires an explicit role", async () => {
    const withoutRole = {
      email: validUser.email,
      firstName: validUser.firstName,
      lastName: validUser.lastName,
      passwordHash: validUser.passwordHash,
    }

    await inRolledBackTransaction(async (tx) => {
      await expect(
        // @ts-expect-error role is required at the type level too
        tx.user.create({ data: withoutRole })
      ).rejects.toThrow(/role/i)
    })
  })
})
