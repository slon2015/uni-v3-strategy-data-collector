import { ResolvedPriceData } from "../persistence";
import { CommonResult, RequiredPricePoints } from "./types";

export interface IFetcher<Args extends Array<any>, Result extends object> {
  getDataRequirements(
    ...args: Args
  ): Promise<RequiredPricePoints> | RequiredPricePoints;
  calculate(
    data: ResolvedPriceData,
    ...args: Args
  ): Promise<Result & CommonResult> | (Result & CommonResult);
}
