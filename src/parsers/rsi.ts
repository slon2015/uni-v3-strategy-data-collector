import { CommonResult, IFetcher, RequiredPricePoints } from "../fetchers";
import { NewPoolDto, BlockNumber, ResolvedPriceData } from "../persistence";

export type RsiOutput = {
  rsi: number;
};

type RsiArgs = [NewPoolDto, BlockNumber, number, number];

export class RsiFetcher implements IFetcher<RsiArgs, RsiOutput> {
  constructor() {}

  getDataRequirements(
    pool: NewPoolDto,
    blockNumber: BlockNumber,
    intervalsCount: number,
    step: number
  ): RequiredPricePoints {
    return {
      chainId: pool.chainId,
      poolAddress: pool.address,
      blockNumbers: new Array(intervalsCount)
        .fill(0)
        .map((_, i) => blockNumber - step * i),
    };
  }

  async calculate(
    data: ResolvedPriceData,
    _: NewPoolDto,
    blockNumber: BlockNumber,
    intervalsCount: number,
    step: number
  ): Promise<RsiOutput & CommonResult> {
    const prevObservations = new Array(intervalsCount)
      .fill(0)
      .map((_, i) => blockNumber - step * i)
      .map((bn) => data[bn]);

    const profits: Array<number> = [];
    const losses: Array<number> = [];

    for (let index = 1; index < prevObservations.length; index++) {
      const prevObservation = prevObservations[index];
      const observation = prevObservations[index - 1];

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
      currentPrice: prevObservations[0],
    };
  }
}
