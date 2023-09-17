import { ethers } from "ethers";
import { config } from "./src/config";
import { RsiFetcher } from "./src/parsers/rsi";
import { PoolService, PriceService, initDataSource } from "./src/persistence";
import { DataProvider } from "./src/data-provider";

async function main() {
  const conf = config();
  const provider = new ethers.providers.JsonRpcProvider(conf.rpcUrl);

  const chainId = (await provider.getNetwork()).chainId;

  const prices = new PriceService();
  const poolService = new PoolService();
  const dataProvider = new DataProvider(provider, prices);

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

  const smaFetcher = new RsiFetcher();
  const blockNumber = conf.blockNumber || (await provider.getBlockNumber());

  const requirements = smaFetcher.getDataRequirements(
    pool,
    blockNumber,
    conf.intervals,
    conf.step
  );

  const data = await dataProvider.provide(requirements, pool);

  const result = await smaFetcher.calculate(
    data,
    pool,
    blockNumber,
    conf.intervals,
    conf.step
  );

  console.log(`RSI: ${result.rsi}%`);
}

main();
