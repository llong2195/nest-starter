import { DEFAULT_LOCALE } from '@configs/config';
import { Injectable } from '@nestjs/common';

import langs from './locales/index';

@Injectable()
export class I18nService {
    static langs: Map<string, Map<string, string>>;
    static languageDefault = DEFAULT_LOCALE || 'vi';

    static init(): void {
        I18nService.langs = langs;
    }

    lang(message: string, language: string = null): string {
        const lang = language ? language : I18nService.languageDefault;

        if (I18nService.langs) {
            if (I18nService.langs.has(lang)) {
                return I18nService.langs.get(lang).get(message) ?? message;
            } else {
                //fallback to default
                return I18nService.langs.get(I18nService.languageDefault).get(message) ?? message;
            }
        }

        return message;
    }
}
