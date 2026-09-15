import { z } from 'zod';

const clientSchema = z.object({
  // Optional: without it the analytics script is never injected, which is the
  // normal state locally.
  VITE_OPENPANEL_CLIENT_ID: z.string().min(1).optional(),
});

export type ClientEnv = z.infer<typeof clientSchema>;

export function parseClientEnv(source: Record<string, string | undefined>): ClientEnv {
  const result = clientSchema.safeParse(source);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid client environment:\n${issues}`);
  }
  return result.data;
}
