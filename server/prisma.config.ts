import "dotenv/config";
import { defineConfig } from '@prisma/internals'

export default defineConfig({
  migrations: {
    seed: './prisma/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
})