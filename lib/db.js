
import { PrismaClient } from '@prisma/client';

const g = globalThis;

let prismaSingleton;

function getPrisma() {
  if (!prismaSingleton) {
    prismaSingleton = g.__prisma || new PrismaClient();
    if (process.env.NODE_ENV !== 'production') {
      g.__prisma = prismaSingleton;
    }
  }
  return prismaSingleton;
}

/**
 * Lazily connects on first use so modules can be imported during `next build`
 * without DATABASE_URL. Runtime routes and scripts still throw on the first
 * query if the variable is unset.
 */
export const prisma = new Proxy(
  {},
  {
    get(_target, prop) {
      const client = getPrisma();
      const value = Reflect.get(client, prop);
      return typeof value === 'function' ? value.bind(client) : value;
    },
  }
);
