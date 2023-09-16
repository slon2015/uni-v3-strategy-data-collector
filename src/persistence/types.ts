import Big from "big.js";

export type PriceSource = "cache" | "chain";

export type BlockNumber = number;

export type NewPriceDto = {
  blockNumber: number;
  price: Big;
};

export type NewPoolDto = {
  chainId: number;
  address: string;
  token0: {
    decimals: number;
  };
  token1: {
    decimals: number;
  };
};

export type PriceDataLocations = Record<BlockNumber, PriceSource>;
export type ResolvedPriceData = Record<BlockNumber, Big>;
