import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'
import "dotenv/config"
// This code initializes a Redis client and sets up a rate limiter using Upstash's Redis service.


const ratelimit = new Ratelimit({
 redis: Redis.fromEnv(),
 limiter: Ratelimit.slidingWindow(100,"60 s"),
})

export default ratelimit;
// This code sets up a rate limiter using Upstash's Redis service.