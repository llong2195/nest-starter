import { Injectable } from '@nestjs/common';

import { DEFAULT_LOCALE } from '../../configs';
import langs from './locales/index';

@Injectable()
export class I18nService {
  static langs: Map<string, Map<string, string>>;
  static languageDefault = DEFAULT_LOCALE || 'vi';

  static init(): void {
    I18nService.langs = langs;
  }

  lang(message: string, language?: string): string {
    const lang = language ? language : I18nService.languageDefault;

    if (I18nService.langs) {
      if (I18nService.langs.has(lang)) {
        const langMap = I18nService.langs.get(lang);
        return langMap ? (langMap.get(message) ?? message) : message;
      } else {
        //fallback to default
        const defaultLangMap = I18nService.langs.get(
          I18nService.languageDefault,
        );
        return defaultLangMap
          ? (defaultLangMap.get(message) ?? message)
          : message;
      }
    }

    return message;
  }
}
