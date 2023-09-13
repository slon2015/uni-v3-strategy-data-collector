import { ethers } from "ethers";
import { fetchObservation } from "./oracle";
import Big from "big.js";

export type RsiInput = {
  blockNumber: number;
  prevObservations: Array<Big>;
};

export type RsiOutput = {
  rsi: number;
};

export async function collectRsiInput(
  provider: ethers.providers.Provider,
  blockNumber: number,
  pool: string,
  intervals: number,
  step: number,
  decimals0: number,
  decimals1: number
): Promise<RsiInput> {
  const prevObservations = await Promise.all(
    new Array(intervals)
      .fill(0)
      .map((_, i) => blockNumber - step * i)
      .map((blockNumber) => fetchObservation(provider, blockNumber, pool))
  );

  return {
    blockNumber,
    prevObservations: prevObservations.map((t) =>
      t.div(Big(10).pow(decimals1 - decimals0))
    ),
  };
}

export function calculateRsi(input: RsiInput): RsiOutput {
  const profits: Array<number> = [];
  const losses: Array<number> = [];

  for (let index = 1; index < input.prevObservations.length; index++) {
    const prevObservation = input.prevObservations[index];
    const observation = input.prevObservations[index - 1];

    const change = observation.sub(prevObservation);

    if (change.gt(0)) {
      profits.push(change.toNumber());
    } else {
      losses.push(Math.abs(change.toNumber()));
    }
  }

  const avgProfit = profits.reduce((acc, p) => acc + p, 0) / profits.length;
  const avgLosses = losses.reduce((acc, l) => acc + l, 0) / losses.length;

  const rs = avgProfit / avgLosses;

  return {
    rsi: Math.floor(100 - 100 / (1 + rs)),
  };
}
