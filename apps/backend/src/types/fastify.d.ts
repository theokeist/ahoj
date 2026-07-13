import "fastify";
import type { DB } from "../db/index.js";
import type { Redis } from "ioredis";

declare module "fastify" {
  interface FastifyInstance {
    db: DB;
    redis: Redis;
  }
}
