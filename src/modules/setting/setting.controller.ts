import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { SettingService } from './setting.service';

@ApiTags('v1/setting')
@Controller({ version: '1', path: 'setting' })
export class SettingController {
  constructor(private readonly settingService: SettingService) {}
}
