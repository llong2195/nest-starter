import contentDisposition from 'content-disposition';
import { parse } from 'csv-parse';
import { Response } from 'express';
import { contentType, lookup } from 'mime-types';
import * as XLSX from 'xlsx';

import { ExportExcelType } from '@/common/enums/app.enum';
import { ValidateError } from '@/common/exceptions/errors';
import { HttpStatus } from '@nestjs/common';

import { bufferToStream } from './util';

export interface ExcelSheet {
  sheetName: string;
  header: string[];
  rows: { [key: string]: any }[];
}

export class ExcelHelper {
  /**
   * Adds a new sheet to the provided workbook with the given header and rows.
   *
   * @param workBook - The workbook to which the new sheet will be added. This should be created using `XLSX.utils.book_new()`.
   * @param header - An array of strings representing the header row for the new sheet.
   * @param rows - An array of objects representing the data rows to be added to the new sheet.
   * @param worksheetName - The name of the new sheet to be added to the workbook.
   * @returns The updated workbook with the new sheet added.
   */
  static addSheetToWorkBook(
    workBook: XLSX.WorkBook, // XLSX.utils.book_new();
    header: string[],
    rows: object[],
    worksheetName: string,
  ) {
    const ws = XLSX.utils.json_to_sheet(rows as any[]); // convert data to sheet
    XLSX.utils.sheet_add_aoa(ws, [header], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workBook, ws, worksheetName); // add sheet to workbook

    return workBook;
  }

  /**
   * Streams an Excel workbook as a response.
   *
   * @param response - The Express response object to send the response.
   * @param workBook - The Excel workbook to be streamed.
   * @param type - The type of Excel export (XLSX or CSV).
   *
   * The function converts the workbook to a buffer, then to a stream, and sets the appropriate headers
   * for the response before sending the stream.
   */
  static streamExcel(
    response: Response,
    workBook: XLSX.WorkBook,
    type: ExportExcelType,
  ) {
    const exportType = type === ExportExcelType.XLSX ? 'xlsx' : 'csv';

    const resp = XLSX.write(workBook, {
      bookType: exportType,
      type: 'buffer',
    }) as Buffer;

    const stream = bufferToStream(resp); // convert buffer to stream

    response.set({
      'Content-Type': contentType(exportType) || 'application/octet-stream',
      'Content-Disposition': contentDisposition(`export.${exportType}`),
    });
    return response.send(stream);
  }

  /**
   * Converts an array of ExcelSheet objects into a workbook.
   *
   * @param {ExcelSheet[]} input - An array of ExcelSheet objects, each containing
   *                               a header, rows, and a sheet name.
   * @returns {XLSX.WorkBook} - A new workbook containing the provided sheets.
   */
  static convertToWorkBook(input: ExcelSheet[]): XLSX.WorkBook {
    const workBook = XLSX.utils.book_new();

    input.forEach((sheet) => {
      ExcelHelper.addSheetToWorkBook(
        workBook,
        sheet.header,
        sheet.rows,
        sheet.sheetName,
      );
    });

    return workBook;
  }

  /**
   * Converts a CSV file to a JSON array.
   *
   * @param {Express.Multer.File} file - The CSV file to be converted.
   * @returns {Promise<any[]>} A promise that resolves to an array of JSON objects representing the rows of the CSV file.
   * @throws {Error} If the file type is not CSV.
   */
  static async convertFileToJsonWithParse<T>(
    file: Express.Multer.File,
  ): Promise<T[]> {
    if (!file) {
      throw new ValidateError('FILE_IS_REQUIRED');
    }
    const mimeType = lookup(file.filename);
    if (mimeType !== 'text/csv') {
      throw new Error('Invalid file type. Only CSV files are supported.');
    }
    const buffer = file.buffer;

    return new Promise((resolve, reject) => {
      parse(
        buffer,
        {
          relaxQuotes: true,
          columns: true,
          encoding: 'utf8',
          trim: true,
        },
        (err, data) => {
          if (err) {
            reject(
              new ValidateError(
                err.message,
                HttpStatus.BAD_REQUEST,
                err as Error,
              ),
            );
          } else {
            resolve(data as T[]);
          }
        },
      );
    });
  }

  /**
   * Converts a CSV file to a JSON array.
   *
   * @param {Express.Multer.File} file - The CSV file to be converted.
   * @returns {Promise<any[]>} A promise that resolves to an array of JSON objects representing the rows of the CSV file.
   * @throws {Error} If the file type is not CSV.
   */
  static async convertFileToJson<T>(file: Express.Multer.File): Promise<T[]> {
    if (!file) {
      throw new ValidateError('FILE_IS_REQUIRED');
    }
    const mimeType = lookup(file.filename);
    if (mimeType !== 'text/csv') {
      throw new Error('Invalid file type. Only CSV files are supported.');
    }
    const buffer = file.buffer;

    return new Promise((resolve, reject) => {
      const rows: T[] = [];
      bufferToStream(buffer)
        .pipe(
          parse({
            columns: true,
            relaxQuotes: true,
            trim: true,
          }),
        )
        .on('data', (row) => {
          rows.push(row as T);
        })
        .on('end', () => {
          resolve(rows);
        })
        .on('error', (err) => {
          reject(new ValidateError(err.message, HttpStatus.BAD_REQUEST, err));
        });
    });
  }

  /**
   * Converts a CSV file to JSON by streaming its contents and processing each row with a callback function.
   *
   * @param {Express.Multer.File} file - The CSV file to be converted.
   * @param {(data: any, index: number) => Promise<void>} callback - A callback function to process each row of the CSV file.
   * @returns {Promise<void>} A promise that resolves when the entire file has been processed.
   * @throws {Error} Throws an error if the file type is not CSV.
   */
  static async streamFileToJson(
    file: Express.Multer.File,
    callback: <T>(data: T, index: number) => Promise<void>,
  ): Promise<void> {
    if (!file) {
      throw new ValidateError('FILE_IS_REQUIRED');
    }
    const mimeType = lookup(file.filename);
    if (mimeType !== 'text/csv') {
      throw new Error('Invalid file type. Only CSV files are supported.');
    }
    const buffer = file.buffer;

    let index = 0;
    return new Promise((resolve, reject) => {
      bufferToStream(buffer)
        .pipe(
          parse({
            columns: true,
            relaxQuotes: true,
            trim: false,
          }),
        )
        .on('data', (row) => {
          void callback(row, ++index);
        })
        .on('end', () => {
          resolve();
        })
        .on('error', (err) => {
          reject(new ValidateError(err.message, HttpStatus.BAD_REQUEST, err));
        });
    });
  }
}
