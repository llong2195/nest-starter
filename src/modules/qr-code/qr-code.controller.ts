import { Response } from 'express';

import { Body, Controller, Get, Header, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { generateQR } from '@utils/util';

import { QRCodeDto } from './dto/create-qr-code.dto';

@ApiTags('v1/qr-code')
@Controller('v1/qr-code')
export class QrCodeController {
    @Get()
    @Header('Content-Type', 'image/png')
    getQRCode(@Body() param: QRCodeDto, @Res() res: Response) {
        const qr = generateQR(param.text, param.size);
        res.send(qr);
    }
}
