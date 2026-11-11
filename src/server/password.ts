import "server-only"

import { randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from "node:crypto"


const N = 2 ** 17
const r = 8
const p = 1
const KEY_LENGTH = 64
const SALT_LENGTH = 16

function deriveKey(password: string, salt: Buffer, options: ScryptOptions, keyLength: number) {
  return new Promise<Buffer>((resolve, reject) => {
    scrypt(password.normalize("NFKC"), salt, keyLength, options, (err, key) =>
      err ? reject(err) : resolve(key)
    )
  })
}

function maxmemFor(n: number, blockSize: number) {
  return 256 * n * blockSize
}


export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH)
  const key = await deriveKey(password, salt, { N, r, p, maxmem: maxmemFor(N, r) }, KEY_LENGTH)
  return ["scrypt", N, r, p, salt.toString("base64"), key.toString("base64")].join("$")
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algorithm, nStr, rStr, pStr, saltB64, hashB64] = stored.split("$")
  if (algorithm !== "scrypt" || !saltB64 || !hashB64) return false

  const n = Number(nStr)
  const blockSize = Number(rStr)
  const parallel = Number(pStr)
  const expected = Buffer.from(hashB64, "base64")

  const actual = await deriveKey(
    password,
    Buffer.from(saltB64, "base64"),
    { N: n, r: blockSize, p: parallel, maxmem: maxmemFor(n, blockSize) },
    expected.length
  )
  return timingSafeEqual(actual, expected)
}
