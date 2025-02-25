import { Module } from '@nestjs/common';

import { QrCodeController } from './qr-code.controller';

@Module({
  controllers: [QrCodeController],
  providers: [],
})
export class QrCodeModule {}
