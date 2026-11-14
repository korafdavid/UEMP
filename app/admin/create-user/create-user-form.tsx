"use client"

import Link from "next/link"
import { useActionState } from "react"

import { createUser } from "@/app/actions/users"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const roles = [
  { label: "Admin", value: "ADMIN" },
  { label: "Lecturer", value: "LECTURER" },
  { label: "Student", value: "STUDENT" },
]

const toErrors = (messages?: string[]) => messages?.map((message) => ({ message }))

export function CreateUserForm() {
  const [state, formAction, pending] = useActionState(createUser, undefined)
  const errors = state?.errors
  const values = state?.values

  return (
    // Remount after a successful create so the fields reset.
    <form key={state?.success ?? "form"} action={formAction} noValidate className="w-full max-w-sm">
      <FieldGroup>
        {state?.success && (
          <p role="status" className="text-sm text-green-600">
            {state.success}
          </p>
        )}
        <div className="grid grid-cols-2 gap-4">
          <Field data-invalid={!!errors?.firstName || undefined}>
            <FieldLabel htmlFor="firstName">First name</FieldLabel>
            <Input id="firstName" name="firstName" defaultValue={values?.firstName} required />
            <FieldError errors={toErrors(errors?.firstName)} />
          </Field>
          <Field data-invalid={!!errors?.lastName || undefined}>
            <FieldLabel htmlFor="lastName">Last name</FieldLabel>
            <Input id="lastName" name="lastName" defaultValue={values?.lastName} required />
            <FieldError errors={toErrors(errors?.lastName)} />
          </Field>
        </div>
        <Field data-invalid={!!errors?.email || undefined}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="off"
            defaultValue={values?.email}
            required
          />
          <FieldError errors={toErrors(errors?.email)} />
        </Field>
        <Field data-invalid={!!errors?.password || undefined}>
          <FieldLabel htmlFor="password">Temporary password</FieldLabel>
          <Input id="password" name="password" type="password" autoComplete="new-password" required />
          <FieldError errors={toErrors(errors?.password)} />
        </Field>
        <Field data-invalid={!!errors?.role || undefined}>
          <FieldLabel htmlFor="role">Role</FieldLabel>
          <Select items={roles} name="role" defaultValue={values?.role ?? "STUDENT"}>
            <SelectTrigger id="role">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {roles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <FieldError errors={toErrors(errors?.role)} />
        </Field>
        <Field orientation="horizontal">
          <Button variant="outline" nativeButton={false} render={<Link href="/admin" />}>
            Cancel
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Creating..." : "Create User"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
