import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
    protected getTracker(request: Record<string, any>): Promise<string> {
        return new Promise<string>(resolve => {
            const tracker = request.ips.length > 0 ? request.ips[0] : request.ip; // individualize IP extraction to meet your own needs
            resolve(tracker);
        });
    }
}
