import { Logger } from 'typeorm';

import { LoggerService } from './custom.logger';

export class DbCustomLogger implements Logger {
  constructor(private logger: LoggerService) {}
  /**
   * Logs query and parameters used in it.
   * @param {string} query - The query that was executed.
   * @param {unknown[]} [parameters] - []
   * @param {QueryRunner} [queryRunner] - The QueryRunner instance that is used to execute queries.
   */
  logQuery(query: string, parameters?: unknown[]): void {
    this.logger.log('logQuery->>>:', [query, parameters]);
  }

  /**
   * Logs a failed query and parameters used for that query.
   * @param {string | Error} error - string | Error
   * @param {string} query - The query that was executed.
   * @param {unknown[]} [parameters] -
   * @param {QueryRunner} [queryRunner] - QueryRunner
   */
  logQueryError(
    error: string | Error,
    query: string,
    parameters?: unknown[],
  ): void {
    this.logger.error('logQueryError->>>:', error, query, parameters);
  }

  /**
   * Logs a query that is slow.
   * @param {number} time - The time it took to execute the query in milliseconds.
   * @param {string} query - The query that was executed.
   * @param {unknown[]} [parameters] -
   * @param {QueryRunner} [queryRunner] - QueryRunner
   */
  logQuerySlow(time: number, query: string, parameters?: unknown[]): void {
    this.logger.warn('logQuerySlow->>>:', time, query, parameters);
  }

  /**
   * This function logs the message to the console if the queryRunner is not undefined.
   * @param {string} message - The message to be logged.
   * @param {QueryRunner} [queryRunner] - The QueryRunner instance that is used to execute queries.
   */
  logSchemaBuild(message: string): void {
    this.logger.debug('logSchemaBuild->>>:', message);
  }

  /**
   * This function logs a message to the console, but only if the debug flag is set to true.
   * @param {string} message - The message to log.
   * @param {QueryRunner} [queryRunner] - The QueryRunner instance that is used to execute queries.
   */
  logMigration(message: string): void {
    this.logger.debug('logMigration->>>:', message);
  }

  /**
   * If the level is info, log the message as debug, if the level is warn, log the message as warn,
   * otherwise log the message as log.
   * @param {'log' | 'info' | 'warn'} level - 'log' | 'info' | 'warn'
   * @param {unknown} message - The message to log.
   * @param {QueryRunner} [queryRunner] - QueryRunner - QueryRunner instance.
   * @returns The return type is void.
   */
  log(level: 'log' | 'info' | 'warn', message: unknown): void {
    switch (level) {
      case 'info':
        return this.logger.debug(message);
      case 'warn':
        return this.logger.warn(message);
      case 'log':
      default:
        return this.logger.log(message);
    }
  }
}
