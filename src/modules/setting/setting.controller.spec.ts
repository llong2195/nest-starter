import { Test, TestingModule } from '@nestjs/testing';

import { SettingController } from './setting.controller';
import { SettingService } from './setting.service';

describe('SettingController', () => {
  let controller: SettingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SettingController],
      providers: [SettingService],
    }).compile();

    controller = module.get<SettingController>(SettingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
