import { ExpressionHelper } from './expression.helper';

export class EmailHelper {
  /**
   * @link https://stackoverflow.com/questions/16416610/replace-unicode-space-characters
   * @param str
   * @returns
   */
  static replaceUnicodeSpaceChar = (str: string) => {
    return str.replace(
      new RegExp(
        /[\u00A0\u1680\u180e\u2000-\u2009\u200a\u200b\u202f\u205f\u3000]/g,
      ),
      ' ',
    );
  };

  /**
   * Replaces placeholders in the given HTML string with corresponding values from the templateValues map.
   *
   * @param html - The HTML string containing placeholders to be replaced.
   * @param templateValues - A map where the keys are the placeholders to be replaced and the values are the corresponding replacement values.
   * @returns The HTML string with all placeholders replaced by their corresponding values.
   */
  static replaceTemplateValues(
    html: string,
    templateValues: Map<string, string>,
  ) {
    for (const key of templateValues.keys()) {
      const regex = new RegExp(key, 'gm');
      const value = templateValues.get(key) ?? '';
      html = html.replace(regex, value);
    }
    return html;
  }

  static replaceExpression(html: string) {
    return html?.replace(
      /\[[\s]*(?:=[\s]*\{([0-9\s.+*/()-]+)\}[\s]*)?\]/g,
      (str: string, param: any) => {
        try {
          str = String(parseFloat(`${ExpressionHelper.evaluate(param)}`));
        } catch (ex) {
          str = '#invalid calculation#';
        }
        return str;
      },
    );
  }
}
