import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // Use dummy URL during build if DATABASE_URL is not set (Prisma Accelerate)
    url: process.env.DATABASE_URL || 'prisma+postgres://accelerate.prisma-data.net/?api_key=build-time-placeholder',
  },
})
        