/**
 * YDB adapter.
 * See: https://cloud.yandex.com/en-ru/docs/ydb/best_practices/timeouts
 */
import { Ydb } from 'ydb-sdk-lite';
import { IState, StateData } from '.';
import { config } from '../config';
import { logger } from '../logger';

// ydb driver singleton
let ydb: Ydb;

function getYdbInstance(iamToken: string) {
  if (!ydb || ydb.iamToken !== iamToken) {
    ydb?.destroy().catch(e => logger.error(e));
    ydb = new Ydb({
      dbName: config.ydbName,
      tablePathPrefix: config.ydbPath,
      iamToken,
    });
  }
  return ydb;
}

export class YdbState implements IState {
  ydb: Ydb;
  constructor(private options: { iamToken: string, ownerId: string }) {
    this.ydb = getYdbInstance(options.iamToken);
  }

  async load(): Promise<StateData> {
    return this.loadJsonData('state') || {};
  }

  async save(data: StateData) {
    await this.saveJsonData('state', data);
  }

  private async loadJsonData(table: string) {
    const query = `
      DECLARE $ownerId AS String;
      SELECT data FROM ${table} WHERE ownerId = $ownerId;
    `;
    const params = { ownerId: this.options.ownerId };
    const [ rows ] = await this.ydb.executeDataQuery(
      query,
      params,
      Ydb.AUTO_TX_RO,
      {},
      { keepInCache: true }
    );
    return rows.length > 0 ? JSON.parse(rows[0].data as string) : null;
  }

  private async saveJsonData(table: string, data: unknown) {
    const query = `
      DECLARE $ownerId AS String;
      DECLARE $data AS JsonDocument;
      UPSERT INTO ${table} (ownerId, updatedAt, data) VALUES ($ownerId, CurrentUtcTimestamp(), $data);
    `;
    const params = { ownerId: this.options.ownerId, data };
    await this.ydb.executeDataQuery(
      query,
      params,
      Ydb.AUTO_TX_RW,
      {},
      { keepInCache: true },
    );
  }
}
