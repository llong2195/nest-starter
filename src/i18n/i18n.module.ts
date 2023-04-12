import { Global, Module } from '@nestjs/common';

import { I18nService } from './i18n.service';
import { MessageService } from './message.service';

export const I18N_SERVICE = 'I18N_SERVICE';

@Global()
@Module({
    providers: [
        {
            provide: I18N_SERVICE,
            useClass: I18nService,
        },
        MessageService,
    ],
    exports: [
        {
            provide: I18N_SERVICE,
            useClass: I18nService,
        },
        MessageService,
    ],
})
export class I18nModule {}
