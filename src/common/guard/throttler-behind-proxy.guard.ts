import { Request } from 'express';

import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { getClientIp } from '@supercharge/request-ip';

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  protected getTracker(request: Request): Promise<string> {
    return new Promise<string>((resolve) => {
      const ip = getClientIp(request);
      const userAgent = request.headers['user-agent'] ?? '';
      const tracker = ip + '_' + userAgent.replace(/\s/g, '') + '_throttle';
      resolve(tracker);
    });
  }
}
