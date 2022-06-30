import { createReactQueryHooks } from '@trpc/react';
import { AppRouter } from 'server';

export const trpc = createReactQueryHooks<AppRouter>();
