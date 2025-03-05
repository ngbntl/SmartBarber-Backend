import { compareSync, hashSync } from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PasswordService {
  private readonly saltRounds: number;

  constructor(private readonly configService: ConfigService) {
    this.saltRounds = this.configService.get<number>('app.salt_round');
  }

  encryptPassword(password: string): string {
    return hashSync(password, Number(this.saltRounds));
  }

  comparePassword(input: string, hashed: string): boolean {
    return compareSync(input, hashed);
  }
}
