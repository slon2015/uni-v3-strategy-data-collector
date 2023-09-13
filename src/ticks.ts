import { TickMath } from "@uniswap/v3-sdk";
import Big from "big.js";

export function tickToPrice(tick: Big): Big {
  const ratio = TickMath.getSqrtRatioAtTick(tick.round().toNumber());

  return Big(ratio.toString()).pow(2).div(Big(2).pow(192));
}
