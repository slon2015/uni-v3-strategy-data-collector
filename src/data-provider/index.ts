import { providers } from "ethers";
import Big from "big.js";

import {
  PriceDataLocations,
  PriceService,
  ResolvedPriceData,
} from "../persistence";
import { fetchObservation } from "../chain/oracle";
import { BlockNumber, NewPoolDto } from "../persistence/types";
import { RequiredPricePoints } from "../fetchers";

export class DataProvider {
  constructor(
    private readonly provider: providers.Provider,
    private readonly prices: PriceService
  ) {}

  private async resolveLocations(
    requirements: RequiredPricePoints
  ): Promise<PriceDataLocations> {
    return this.prices.checkPriceInCache(requirements);
  }

  async provide(
    requirements: Pick<RequiredPricePoints, "blockNumbers">,
    { chainId, address, token0, token1 }: NewPoolDto
  ): Promise<ResolvedPriceData> {
    const locations = await this.resolveLocations({
      ...requirements,
      chainId,
      poolAddress: address,
    });

    const cachedPriceIds = Object.entries(locations)
      .filter(([_, source]) => source === "cache")
      .map(([bn]) => Number.parseInt(bn));

    const cachedData =
      cachedPriceIds.length > 0
        ? await this.prices.getPrices(cachedPriceIds, chainId, address)
        : {};

    const chainData = await Promise.all(
      Object.entries(locations)
        .filter(([_, source]) => source === "chain")
        .map<Promise<[BlockNumber, Big]>>(async ([bn]) => {
          const blockNumber = Number.parseInt(bn);
          const price = await fetchObservation(
            this.provider,
            blockNumber,
            address
          );
          return [
            blockNumber,
            price.div(Big(10).pow(token1.decimals - token0.decimals)),
          ];
        })
    );

    if (chainData.length > 0) {
      await this.prices.saveNewPrices(
        chainData.map((cd) => ({ blockNumber: cd[0], price: cd[1] })),
        chainId,
        address
      );
    }

    return {
      ...cachedData,
      ...Object.fromEntries(chainData),
    };
  }
}
