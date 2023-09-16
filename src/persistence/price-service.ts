import Big from "big.js";
import { In } from "typeorm";

import { appDataSource } from "./data-source";
import {
  BlockNumber,
  NewPriceDto,
  PriceDataLocations,
  ResolvedPriceData,
} from "./types";
import { Pool, Price } from "./entities";
import { RequiredPricePoints } from "../fetchers";

export class PriceService {
  async checkPriceInCache({
    chainId,
    poolAddress,
    blockNumbers,
  }: RequiredPricePoints): Promise<PriceDataLocations> {
    const dbResults = await appDataSource.getRepository(Price).find({
      where: {
        pool: {
          chainId,
          address: poolAddress,
        },
        blockNumber: In(blockNumbers),
      },
      select: {
        blockNumber: true,
      },
    });

    const blockNumbersFoundInCache = dbResults.map((r) => r.blockNumber);

    return Object.fromEntries(
      blockNumbers.map((bn) => [
        bn,
        blockNumbersFoundInCache.includes(bn) ? "cache" : "chain",
      ])
    );
  }

  async getPrices(
    blockNumbers: Array<BlockNumber>,
    chainId: number,
    poolAddress: string
  ): Promise<ResolvedPriceData> {
    const dbResults = await appDataSource.getRepository(Price).find({
      where: {
        pool: {
          chainId,
          address: poolAddress,
        },
        blockNumber: In(blockNumbers),
      },
      select: {
        blockNumber: true,
        price: true,
      },
    });

    return Object.fromEntries(
      dbResults.map((row) => [row.blockNumber, Big(row.price)])
    );
  }

  async saveNewPrices(
    prices: Array<NewPriceDto>,
    chainId: number,
    poolAddress: string
  ): Promise<void> {
    await appDataSource.transaction(async (em) => {
      const pool = await em.getRepository(Pool).findOneOrFail({
        where: {
          address: poolAddress,
          chainId,
        },
      });
      await em.getRepository(Price).insert(
        prices.map(({ blockNumber, price }) => ({
          blockNumber,
          price: price.toFixed(),
          pool,
        }))
      );
    });
  }
}
