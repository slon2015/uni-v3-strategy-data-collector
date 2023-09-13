import env from "env-var";

type Config = {
  rpcUrl: string;
  poolAddress: string;
  step: number;
  intervals: number;
  blockNumber?: number;
  decimals0: number;
  decimals1: number;
};

const ONE_DAY = Math.floor((24 * 60 * 60) / 14);
const DEFAULT_INTERVALS = 14;

export function config(): Config {
  return {
    rpcUrl: env.get("RPC_URL").required().asUrlString(),
    poolAddress: env.get("POOL_ADDRESS").required().asString(),
    step: Math.floor(
      ONE_DAY *
        env.get("RSI_INTERVAL_STEP_IN_DAYS").default(1).asFloatPositive()
    ),
    intervals: env
      .get("RSI_INTERVAL_COUNT")
      .default(DEFAULT_INTERVALS)
      .asIntPositive(),
    decimals0: env.get("DECIMALS0").required().asIntPositive(),
    decimals1: env.get("DECIMALS1").required().asIntPositive(),
    blockNumber: env.get("BLOCK_NUMBER").asIntPositive(),
  };
}
