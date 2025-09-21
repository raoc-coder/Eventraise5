import { setupServer } from 'msw/node'
import { supabaseHandlers, stripeHandlers, appHandlers } from './handlers'

// This configures a request mocking server with the given request handlers.
export const server = setupServer(
  ...supabaseHandlers,
  ...stripeHandlers,
  ...appHandlers
)
