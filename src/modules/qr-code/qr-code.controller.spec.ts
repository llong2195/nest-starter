import { Test, TestingModule } from '@nestjs/testing';

import { QrCodeController } from './qr-code.controller';

describe('QrCodeController', () => {
  let controller: QrCodeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QrCodeController],
    }).compile();

    controller = module.get<QrCodeController>(QrCodeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
