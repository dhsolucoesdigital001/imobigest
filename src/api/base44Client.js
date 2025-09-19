import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "68cc48bac9f58f29066b1564", 
  requiresAuth: true // Ensure authentication is required for all operations
});
