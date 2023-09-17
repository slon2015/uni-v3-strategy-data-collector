import Big from "big.js";

import { providers, BigNumber } from "ethers";

export type Observation = {
  blockTimestamp: number;
  tickCumulative: Big;
  secondsPerLiquidityCumulativeX128: Big;
  initialized: boolean;
};

export async function fetchObservation(
  provider: providers.Provider,
  blockNumber: number,
  pool: string
): Promise<Big> {
  const slot0 = await provider.getStorageAt(pool, 0n, blockNumber);
  const priceHex = "0x" + slot0.substring(26);

  return Big(BigNumber.from(priceHex).toString()).pow(2).div(Big(2).pow(192));
}
