"use server"

import * as z from "zod"

import { Prisma } from "@/src/generated/prisma/client"
import { requireRole } from "@/src/server/auth/dal"
import { db } from "@/src/server/db"
import { hashPassword } from "@/src/server/password"

const CreateUserSchema = z.object({
  firstName: z.string().trim().min(1, { error: "Enter a first name." }),
  lastName: z.string().trim().min(1, { error: "Enter a last name." }),
  email: z.string().trim().toLowerCase().pipe(z.email({ error: "Enter a valid email address." })),
  password: z.string().min(8, { error: "Password must be at least 8 characters." }),
  role: z.enum(["ADMIN", "LECTURER", "STUDENT"], { error: "Choose a role." }),
})

export type CreateUserState =
  | {
      values?: { firstName: string; lastName: string; email: string; role: string }
      errors?: Partial<Record<"firstName" | "lastName" | "email" | "password" | "role", string[]>>
      success?: string
    }
  | undefined

export async function createUser(
  _state: CreateUserState,
  formData: FormData
): Promise<CreateUserState> {
  // Server actions are public endpoints: authorize here, not just on the page.
  await requireRole("ADMIN")

  const raw = Object.fromEntries(
    ["firstName", "lastName", "email", "password", "role"].map((k) => [k, formData.get(k) ?? ""])
  ) as Record<string, string>
  const values = { firstName: raw.firstName, lastName: raw.lastName, email: raw.email, role: raw.role }

  const parsed = CreateUserSchema.safeParse(raw)
  if (!parsed.success) return { values, errors: z.flattenError(parsed.error).fieldErrors }

  const { password, ...data } = parsed.data
  try {
    await db.user.create({ data: { ...data, passwordHash: await hashPassword(password) } })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { values, errors: { email: ["A user with this email already exists."] } }
    }
    throw err
  }

  return { success: `Created ${data.role.toLowerCase()} account for ${data.email}.` }
}
