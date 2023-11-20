import camelCase from 'lodash.camelcase';
import CryptoJS from 'crypto-js';
import moment from 'moment';
import QRCode, { QRCodeToFileStreamOptions } from 'qrcode';
import { PassThrough } from 'stream';

/**
 *
 * @returns
 */
export function isDev(): boolean {
    const node_env = process.env.NODE_ENV || 'development';

    return 'development' === node_env;
}

/**
 *
 * @param env
 * @returns
 */
export function isEnv(env: string): boolean {
    const envSystem = process.env.NODE_ENV || 'development';
    return env === envSystem;
}

/**
 *
 * @param length
 * @returns
 */
export function randomString(length = 10): string {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const lastIndex = characters.length - 1;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * lastIndex));
    }
    return result;
}

/**
 *
 * @returns
 */
export function getFullDate(): string {
    const now = new Date();
    return `${now.getFullYear()}_${now.getMonth()}_${now.getDay()}_${now.getHours()}_${now.getMinutes()}_${now.getSeconds()}`;
}

/**
 *
 * @param str
 * @returns
 */
export const base64Encode = (str: string) => {
    const b = Buffer.from(str);
    return b.toString('base64');
};

/**
 *
 * @param str
 * @returns
 */
export const base64Decode = (str: string) => {
    const b = Buffer.from(str, 'base64');
    return b.toString();
};

/**
 *
 * @param str
 * @returns
 */
export const telephoneCheckAndGet = (str: string): string | null => {
    const phone = str.replace(/[^0-9]/g, '');

    const isPhone = /^($|(084|84|))(0?[3|5|7|8|9])([0-9]{8})\b/g.test(phone);

    const isHomePhone = /^($|(084|84|))(0?2)([0-9]{9})\b/g.test(phone);

    if (isPhone || isHomePhone) {
        return toStandard(phone);
    }

    return null;
};

/**
 *
 * @param phone
 * @returns
 */
export const toStandard = (phone: string): string => {
    if ((phone.length === 10 || phone.length === 11) && phone[0] === '0') {
        return `84${phone}`.replace(/840/g, '84');
    } else {
        let p = phone;
        if (p[0] === '0') {
            p = p.replace(/084/g, '84');
        }

        if (p[2] === '0') {
            p = p.replace(/840/g, '84');
        }

        return p;
    }
};

/**
 * It takes a string, removes the first and last characters of the string, and returns the result
 * @param {string} str - The string to be trimmed.
 * @param {string} trim_str - The string to trim from the beginning and end of the string.
 */
export const trim = (str: string, trim_str: string) => {
    const reg = new RegExp(`^${trim_str}+|${trim_str}+$`, 'gm');
    return camelCase(str.replace(reg, ''));
};

/**
 *
 * @param str
 * @returns
 */
export const toSnakeCase = (str: string): string => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

/**
 *
 * @param min
 * @param max
 * @returns
 */
export const getRandomInt = (min: number, max: number): number => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
};

/**
 *
 * @param second
 * @returns
 */
export const currentTimestamp = (second = true): number => {
    if (second) {
        return Math.round(Date.now() / 1000);
    }
    return Date.now();
};

/**
 *
 * @param second
 * @returns
 */
export const startTimeOfDay = (second = true): string | number => {
    if (second) {
        return moment().utcOffset(7).startOf('day').unix();
    }
    return moment().utcOffset(7).startOf('day').format('x');
};

/**
 *
 * @param time unixtime
 * @param second
 * @returns
 */
export const startTimeOfADay = (time: number, second = true): string | number => {
    if (second) {
        return moment(time * 1000)
            .utcOffset(7)
            .startOf('day')
            .unix();
    }
    return moment(time * 1000)
        .utcOffset(7)
        .startOf('day')
        .format('x');
};

/**
 *
 * @param m
 * @returns
 */
export const convertMtoKm = (m: number): number => {
    return Math.round((m * 100) / 1000) / 100;
};

/**
 *
 * @param a
 * @returns
 */
export function uniq<T>(a: T[]): T[] {
    return Array.from(new Set(a));
}

/**
 *
 * @param ms
 * @returns
 */
export const sleep = async (ms: number): Promise<unknown> => {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
};

/**
 *
 * @param strDate
 * @returns
 */
export const toTimestamp = (strDate: string) => {
    const datum = Date.parse(strDate);
    return datum / 1000;
};

/**
 *
 * @param birthday
 * @returns
 */
export const caculateAge = (birthday: string | Date): number => {
    const birthdayYear = new Date(birthday).getFullYear();
    const currentYear = new Date().getFullYear();

    return currentYear - birthdayYear;
};

/**
 *
 * @param text
 * @param size
 * @param qualityLevel
 * @returns
 */
export const generateQR = async (text: string, size = 108, qualityLevel = 'M') => {
    // const qrStream = await QRCode.toDataURL(text, { //errorCorrectionLevel: 'L', version: 8 })
    const qrStream = new PassThrough();
    await QRCode.toFileStream(qrStream, text, {
        // type: 'png',
        width: size,
        errorCorrectionLevel: qualityLevel,
    } as QRCodeToFileStreamOptions);
    // console.log(text, url, qrStream)
    return qrStream;
};

/**
 *
 * @param fromTime
 * @param toTime
 * @returns
 */
export const getDaysDiff = (fromTime: number, toTime: number, tzOffset = -7): number => {
    const OneHour = 3600; //60 * 60,
    const OneDay = 86400; //24 * 60 * 60,
    fromTime = Math.ceil((fromTime - tzOffset * OneHour) / OneDay) * OneDay;
    toTime = Math.ceil((toTime - tzOffset * OneHour) / OneDay) * OneDay;

    return Math.floor((toTime - fromTime) / OneDay);
};

export const encryptObj = (obj: any, secretKey: string): string => {
    // return CryptoJS.AES.encrypt(JSON.stringify(obj), secretKey).toString();
    const encJson = CryptoJS.AES.encrypt(JSON.stringify(obj), secretKey).toString();
    const encData = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(encJson));
    return encData;
};

export const decryptObj = (encryptText: string, secretKey: string): unknown => {
    // const bytes = CryptoJS.AES.decrypt(encryptText, secretKey);
    // return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    const decData = CryptoJS.enc.Base64.parse(encryptText).toString(CryptoJS.enc.Utf8);
    const bytes = CryptoJS.AES.decrypt(decData, secretKey).toString(CryptoJS.enc.Utf8);
    return JSON.parse(bytes);
};
