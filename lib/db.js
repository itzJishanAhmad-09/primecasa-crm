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

export const prisma = new Proxy(
  {},
  {
    get(_target, prop) {
      if (prop === 'then') return undefined;
      const client = getPrisma();
      const value = Reflect.get(client, prop);
      return typeof value === 'function' ? value.bind(client) : value;
    },
  }
);
