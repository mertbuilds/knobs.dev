import { parseClientEnv } from '@knobs/env/client';

export const clientEnv = parseClientEnv({
  VITE_OPENPANEL_CLIENT_ID: import.meta.env['VITE_OPENPANEL_CLIENT_ID'] as string | undefined,
});
