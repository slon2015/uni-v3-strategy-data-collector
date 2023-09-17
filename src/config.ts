import env from "env-var";

type Config = {
  rpcUrl: string;
  poolAddress: string;
  rsi: {
    step: number;
    intervals: number;
  };
  bollingerBands: {
    step: number;
    intervals: number;
    stdDevCount: number;
  };
  blockNumber?: number;
  decimals0: number;
  decimals1: number;
};

const ONE_DAY = Math.floor((24 * 60 * 60) / 14);
const DEFAULT_RSI_INTERVALS = 14;
const DEFAULT_BB_INTERVALS = 20;
const DEFAULT_BB_STD_DEV_COUNT = 2;

export function config(): Config {
  return {
    rpcUrl: env.get("RPC_URL").required().asUrlString(),
    poolAddress: env.get("POOL_ADDRESS").required().asString(),
    rsi: {
      step: Math.floor(
        ONE_DAY *
          env.get("RSI_INTERVAL_STEP_IN_DAYS").default(1).asFloatPositive()
      ),
      intervals: env
        .get("RSI_INTERVAL_COUNT")
        .default(DEFAULT_RSI_INTERVALS)
        .asIntPositive(),
    },
    bollingerBands: {
      step: Math.floor(
        ONE_DAY *
          env.get("BB_INTERVAL_STEP_IN_DAYS").default(1).asFloatPositive()
      ),
      intervals: env
        .get("BB_INTERVAL_COUNT")
        .default(DEFAULT_BB_INTERVALS)
        .asIntPositive(),
      stdDevCount: env
        .get("BB_STD_DEV_COUNT")
        .default(DEFAULT_BB_STD_DEV_COUNT)
        .asFloatPositive(),
    },
    decimals0: env.get("DECIMALS0").required().asIntPositive(),
    decimals1: env.get("DECIMALS1").required().asIntPositive(),
    blockNumber: env.get("BLOCK_NUMBER").asIntPositive(),
  };
}
