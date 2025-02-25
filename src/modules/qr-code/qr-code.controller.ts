import { Response } from 'express';

import { QrCodeHelper } from '@/utils/qr-code.helper';
import {
  Controller,
  Get,
  Header,
  Query,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { QRCodeDto } from './dto/create-qr-code.dto';

@ApiTags('v1/qr-code')
@Controller({ version: '1', path: 'qr-code' })
export class QrCodeController {
  @Get()
  @Header('Content-Type', 'image/png')
  async getQRCode(
    @Query() param: QRCodeDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const qr = await QrCodeHelper.generateQR(param.text, param.size);
    return new StreamableFile(qr);
  }
}
