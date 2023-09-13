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

const DEFAULT_STEP = Math.floor((24 * 60 * 60) / 14);
const DEFAULT_INTERVALS = 14;

export function config(): Config {
  return {
    rpcUrl: env.get("RPC_URL").required().asUrlString(),
    poolAddress: env.get("POOL_ADDRESS").required().asString(),
    step: env.get("SAMPLER_STEP").default(DEFAULT_STEP).asIntPositive(),
    intervals: env
      .get("RSI_INTERVALS")
      .default(DEFAULT_INTERVALS)
      .asIntPositive(),
    decimals0: env.get("DECIMALS0").required().asIntPositive(),
    decimals1: env.get("DECIMALS1").required().asIntPositive(),
    blockNumber: env.get("BLOCK_NUMBER").asIntPositive(),
  };
}
