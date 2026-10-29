import { env } from '../config/env.js';
import { escapeRegex } from './escapeRegex.js';

// "https://eventsphere-*.vercel.app" -> /^https:\/\/eventsphere-[a-z0-9-]+\.vercel\.app$/
const patterns = env.clientUrls.map(
  (url) => new RegExp(`^${url.split('*').map(escapeRegex).join('[a-z0-9-]+')}$`, 'i'),
);

export const isAllowedOrigin = (origin) => patterns.some((pattern) => pattern.test(origin));
