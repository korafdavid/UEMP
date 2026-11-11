"use server"

import { redirect } from "next/navigation"
import * as z from "zod"

import { authenticate } from "@/src/server/auth/credentials"
import { createSession, deleteSession } from "@/src/server/auth/session"

const LoginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email({ error: "Enter a valid email address." })),
  password: z.string().min(1, { error: "Enter your password." }),
})

export type LoginState =
  | {
      email?: string
      errors?: { email?: string[]; password?: string[] }
      message?: string
    }
  | undefined

export async function login(_state: LoginState, formData: FormData): Promise<LoginState> {
  const rawEmail = String(formData.get("email") ?? "")
  const parsed = LoginSchema.safeParse({
    email: rawEmail,
    password: formData.get("password") ?? "",
  })

  if (!parsed.success) {
    return { email: rawEmail, errors: z.flattenError(parsed.error).fieldErrors }
  }

  const result = await authenticate(parsed.data.email, parsed.data.password)

  if (!result.ok) {
    return {
      email: rawEmail,
      message:
        result.reason === "inactive"
          ? "This account has been deactivated. Contact an administrator."
          : "Invalid email or password.",
    }
  }

  await createSession(result.userId)
  redirect("/dashboard")
}

export async function logout() {
  await deleteSession()
  redirect("/login")
}
