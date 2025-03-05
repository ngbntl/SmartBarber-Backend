import { HttpStatus } from '@nestjs/common';

export class MessageResponse {
  statusCode?: HttpStatus;
  message?: string;
}

export class BoolResponse {
  statusCode?: HttpStatus;
  status?: boolean;
}
