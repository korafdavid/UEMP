import "server-only"

import { PrismaPg } from "@prisma/adapter-pg"

import { PrismaClient } from "@/src/generated/prisma/client"

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set")
  }

  return new PrismaClient({
    adapter: createAdapter(connectionString),
    omit: { user: { passwordHash: true } },
  })
}


function createAdapter(connectionString: string) {
  const ca = process.env.DATABASE_CA_CERT
  if (!ca) {
    return new PrismaPg({ connectionString })
  }


  const url = new URL(connectionString)
  url.searchParams.delete("sslmode")

  return new PrismaPg({
    connectionString: url.toString(),
    ssl: { ca, rejectUnauthorized: true },
  })
}

type DbClient = ReturnType<typeof createPrismaClient>

const globalForPrisma = globalThis as unknown as { prisma?: DbClient }

export const db: DbClient = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db
}
