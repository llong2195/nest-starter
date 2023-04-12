import { DEFAULT_LOCALE } from '@configs/config';
import { Injectable } from '@nestjs/common';

import langs from './index';

@Injectable()
export class MessageService {
    static langs: Map<string, Map<string, string>>;
    static languageDefault = DEFAULT_LOCALE || 'vi';

    static init(): void {
        MessageService.langs = langs;
    }

    lang(message: string, language: string = null): string {
        const lang = language ? language : MessageService.languageDefault;

        if (MessageService.langs) {
            if (MessageService.langs.has(lang)) {
                return MessageService.langs.get(lang).get(message) ?? message;
            } else {
                //fallback to default
                return MessageService.langs.get(MessageService.languageDefault).get(message) ?? message;
            }
        }

        return message;
    }
}
