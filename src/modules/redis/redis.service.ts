import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  async setOtp(email: string, otp: string, ttl: number = 300) {
    const key = `otp:${email}`;
    const data = JSON.stringify({
      otp,
      expiresAt: Date.now() + ttl * 1000,
      attempts: 0,
    });
    await this.redis.setex(key, ttl, data);
  }

  async getOtp(
    email: string,
  ): Promise<{ otp: string; expiresAt: number; attempts: number } | null> {
    const data = await this.redis.get(`otp:${email}`);
    return data ? JSON.parse(data) : null;
  }

  async incrementAttempts(email: string): Promise<number> {
    const key = `otp:${email}`;
    const data = await this.getOtp(email);
    if (!data) return 0;

    data.attempts += 1;
    await this.redis.setex(key, 300, JSON.stringify(data));
    return data.attempts;
  }

  async deleteOtp(email: string) {
    await this.redis.del(`otp:${email}`);
  }
}
