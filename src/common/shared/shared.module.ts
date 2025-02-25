import { Global, Module } from '@nestjs/common';

import { I18nService } from './i18n.service';
import { RedisComponent } from './redis.component';
import { RedisService } from './redis.service';

@Global()
@Module({
  imports: [],
  providers: [I18nService, RedisService, RedisComponent],
  exports: [I18nService, RedisService, RedisComponent],
})
export class SharedModule {}
