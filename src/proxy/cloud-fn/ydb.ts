import { Ydb } from 'ydb-sdk-lite';
import { config } from '../../config';
import { logger } from '../../logger';

// ydb driver singleton
let ydb: Ydb;

type Connection = {
  stubId: string,
  connectionId: string,
  createdAt: string,
};

function getYdbInstance(iamToken: string) {
  if (!ydb || ydb.iamToken !== iamToken) {
    ydb?.destroy().catch(e => logger.error(e));
    ydb = new Ydb({
      dbName: config.liveDebugYdbName,
      iamToken,
    });
  }
  return ydb;
}

export class YdbClient {
  ydb: Ydb;
  constructor(iamToken: string) {
    this.ydb = getYdbInstance(iamToken);
  }

  async getConnection(stubId: string) {
    const query = `
      DECLARE $stubId AS Utf8;

      SELECT connectionId, createdAt
      FROM connections WHERE stubId = $stubId
    `;
    const params = { stubId };
    const [ rows ] = await this.ydb.executeDataQuery(
      query,
      params,
      Ydb.AUTO_TX_RO,
      {},
      { keepInCache: true }
    );
    return rows.length > 0 ? rows[0] as Connection : null;
  }

  async saveConnection(stubId: string, connectionId: string) {
    const query = `
      DECLARE $stubId AS Utf8;
      DECLARE $connectionId AS Utf8;

      UPSERT INTO connections (stubId, connectionId, createdAt)
      VALUES ($stubId, $connectionId, CurrentUtcTimestamp());
    `;
    const params = { stubId, connectionId };
    await this.ydb.executeDataQuery(
      query,
      params,
      Ydb.AUTO_TX_RW,
      {},
      { keepInCache: true },
    );
  }
}
