import Big from "big.js";
import { CommonResult, IFetcher, RequiredPricePoints } from "../fetchers";
import { NewPoolDto, BlockNumber, ResolvedPriceData } from "../persistence";

export type SmaOutput = {
  sma: Big;
};

type SmaArgs = [NewPoolDto, BlockNumber, number, number];

export class SmaFetcher implements IFetcher<SmaArgs, SmaOutput> {
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

  calculate(
    data: ResolvedPriceData,
    _: NewPoolDto,
    blockNumber: BlockNumber,
    intervalsCount: number,
    step: number
  ): SmaOutput & CommonResult {
    const prevObservations = new Array(intervalsCount)
      .fill(0)
      .map((_, i) => blockNumber - step * i)
      .map((bn) => data[bn]);

    let acc = Big(0);

    for (let index = 0; index < prevObservations.length; index++) {
      acc = acc.add(prevObservations[index]);
    }

    return {
      sma: acc.div(intervalsCount),
      currentPrice: prevObservations[0],
    };
  }
}
