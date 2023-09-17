import Big from "big.js";
import { BlockNumber, NewPoolDto, ResolvedPriceData } from "../persistence";
import { CommonResult, IFetcher, RequiredPricePoints } from "../fetchers";
import { SmaFetcher } from "./sma";

export type BollingerBandsOutput = {
  sma: Big;
  upperBorder: Big;
  lowerBorder: Big;
  std: Big;
};

type BollingerBandsArgs = [NewPoolDto, BlockNumber, number, number, number];

export class BollingerBandsFetcher
  implements IFetcher<BollingerBandsArgs, BollingerBandsOutput>
{
  private readonly smaFetcher: SmaFetcher;

  constructor() {
    this.smaFetcher = new SmaFetcher();
  }

  getDataRequirements(
    pool: NewPoolDto,
    blockNumber: BlockNumber,
    intervalsCount: number,
    step: number
  ): RequiredPricePoints {
    return this.smaFetcher.getDataRequirements(
      pool,
      blockNumber,
      intervalsCount,
      step
    );
  }

  async calculate(
    data: ResolvedPriceData,
    pool: NewPoolDto,
    blockNumber: BlockNumber,
    intervalsCount: number,
    step: number,
    stdDevCount: number
  ): Promise<BollingerBandsOutput & CommonResult> {
    const { sma, currentPrice } = this.smaFetcher.calculate(
      data,
      pool,
      blockNumber,
      intervalsCount,
      step
    );

    const points = new Array(intervalsCount)
      .fill(0)
      .map((_, i) => blockNumber - step * i)
      .map((bn) => data[bn]);

    const standartDiviation = points
      .map((x) => x.sub(sma).pow(2))
      .reduce((a, b) => a.add(b), Big(0))
      .div(intervalsCount)
      .sqrt();

    return {
      sma,
      currentPrice,
      upperBorder: sma.add(standartDiviation.mul(stdDevCount)),
      lowerBorder: sma.sub(standartDiviation.mul(stdDevCount)),
      std: standartDiviation,
    };
  }
}
