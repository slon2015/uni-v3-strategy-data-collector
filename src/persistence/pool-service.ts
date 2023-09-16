import { appDataSource } from "./data-source";
import { Pool } from "./entities";
import { NewPoolDto } from "./types";

export class PoolService {
  async saveNewPool({
    chainId,
    address,
    token0,
    token1,
  }: NewPoolDto): Promise<void> {
    await appDataSource
      .getRepository(Pool)
      .createQueryBuilder()
      .insert()
      .values({
        chainId,
        address,
        token0,
        token1,
      })
      .orIgnore()
      .execute();
  }
}
