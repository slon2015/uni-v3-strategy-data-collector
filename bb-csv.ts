import { ethers } from "ethers";
import env from "env-var";
import Big from "big.js";

import { config } from "./src/config";
import { PoolService, PriceService, initDataSource } from "./src/persistence";
import { DataProvider } from "./src/data-provider";
import { BollingerBandsFetcher } from "./src/parsers/bollinger";

const ONE_DAY_DISTANCE = Math.floor((24 * 60 * 60) / 14);

async function main() {
  const conf = config();
  const provider = new ethers.providers.JsonRpcProvider(conf.rpcUrl);

  const sampleCount = env.get("SAMPLES_COUNT").required().asIntPositive();
  const sampleDistance = Math.floor(
    ONE_DAY_DISTANCE *
      env.get("SAMPLES_DISTANCE_IN_DAYS").default(3).asFloatPositive()
  );

  const chainId = (await provider.getNetwork()).chainId;

  const prices = new PriceService();
  const poolService = new PoolService();
  const dataProvider = new DataProvider(provider, prices);
  const bbFetcher = new BollingerBandsFetcher();

  const pool = {
    chainId,
    address: conf.poolAddress,
    token0: {
      decimals: conf.decimals0,
    },
    token1: {
      decimals: conf.decimals1,
    },
  };

  await initDataSource();

  await poolService.saveNewPool(pool);

  const blockNumber = await provider.getBlockNumber();

  console.log(
    `block_number;sma;std;bb_lower;bb_upper;price0;${new Array(6)
      .fill(0)
      .map((_, i) => `price${i + 1}`)
      .join(";")};${new Array(6)
      .fill(0)
      .map((_, i) => `diff${i + 1}`)
      .join(";")}`
  );

  for (let index = 0; index < sampleCount; index++) {
    const sampleBlockNumber =
      blockNumber - index * sampleDistance - 6 * ONE_DAY_DISTANCE;

    const requirements = bbFetcher.getDataRequirements(
      pool,
      sampleBlockNumber,
      conf.bollingerBands.intervals,
      conf.bollingerBands.step
    );

    const data = await dataProvider.provide(requirements, pool);

    const { sma, upperBorder, lowerBorder, currentPrice, std } =
      await bbFetcher.calculate(
        data,
        pool,
        sampleBlockNumber,
        conf.bollingerBands.intervals,
        conf.bollingerBands.step,
        conf.bollingerBands.stdDevCount
      );

    const nextPricesMap = await dataProvider.provide(
      {
        blockNumbers: new Array(6)
          .fill(0)
          .map((_, i) => sampleBlockNumber + (1 + i) * ONE_DAY_DISTANCE),
      },
      pool
    );

    const nextPrices = new Array(6)
      .fill(0)
      .map(
        (_, i) => nextPricesMap[sampleBlockNumber + (1 + i) * ONE_DAY_DISTANCE]
      );

    const allPrices = [currentPrice].concat(nextPrices);

    const divs: Array<string> = [];

    for (let index = 1; index < allPrices.length; index++) {
      const price = allPrices[index];
      const prevPrice = allPrices[index - 1];

      const diff = price.sub(prevPrice);
      const diffPercent = diff.div(price.div(100));
      divs.push(diffPercent.round(5).toFixed());
    }

    console.log(
      `${sampleBlockNumber};${sma.toFixed()};${std.toFixed()};${lowerBorder.toFixed()};${upperBorder.toFixed()};${currentPrice.toFixed()};${nextPrices
        .map((p) => p.toFixed())
        .join(";")};${divs.join(";")}`
    );
  }
}

main();
