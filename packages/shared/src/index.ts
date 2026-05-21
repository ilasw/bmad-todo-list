import { z } from 'zod'

export const healthSchema = z.object({
  status: z.literal('ok'),
})

export type HealthResponse = z.infer<typeof healthSchema>
