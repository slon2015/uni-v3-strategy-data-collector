import { BlockNumber } from "../persistence";

export type RequiredPricePoints = {
  chainId: number;
  poolAddress: string;
  blockNumbers: Array<BlockNumber>;
};
