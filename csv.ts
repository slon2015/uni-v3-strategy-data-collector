import { ethers } from "ethers";
import { config } from "./src/config";
import { calculateRsi, collectRsiInput } from "./src/rsi";

import env from "env-var";
import Big from "big.js";
import { fetchObservation } from "./src/oracle";

const ONE_DAY_DISTANCE = Math.floor((24 * 60 * 60) / 14);

async function main() {
  const conf = config();
  const provider = new ethers.providers.JsonRpcProvider(conf.rpcUrl);

  const sampleCount = env.get("SAMPLES_COUNT").required().asIntPositive();
  const sampleDistance = env
    .get("SAMPLES_DISTANCE")
    .default(ONE_DAY_DISTANCE * 3)
    .asIntPositive();

  const blockNumber = await provider.getBlockNumber();

  console.log(
    `block_number;rsi;price0;${new Array(6)
      .fill(0)
      .map((_, i) => `price${i + 1}`)
      .join(";")};${new Array(6)
      .fill(0)
      .map((_, i) => `diff${i + 1}`)
      .join(";")}`
  );

  for (let index = 0; index < sampleCount; index++) {
    const sampleBlockNumber =
      blockNumber - index * sampleDistance - 6 * ONE_DAY_DISTANCE;

    const input = await collectRsiInput(
      provider,
      sampleBlockNumber,
      conf.poolAddress,
      conf.intervals,
      conf.step,
      conf.decimals0,
      conf.decimals1
    );

    const currentPrice = input.prevObservations[0];

    const { rsi } = calculateRsi(input);

    const nextPrices = (
      await Promise.all(
        new Array(6)
          .fill(0)
          .map((_, i) =>
            fetchObservation(
              provider,
              sampleBlockNumber + (1 + i) * ONE_DAY_DISTANCE,
              conf.poolAddress
            )
          )
      )
    ).map((p) => p.div(Big(10).pow(conf.decimals1 - conf.decimals0)));

    const allPrices = [currentPrice].concat(nextPrices);

    const divs: Array<string> = [];

    for (let index = 1; index < allPrices.length; index++) {
      const price = allPrices[index];
      const prevPrice = allPrices[index - 1];

      const diff = price.sub(prevPrice);
      const diffPercent = diff.div(price.div(100));
      divs.push(diffPercent.round(5).toFixed());
    }

    console.log(
      `${sampleBlockNumber};${rsi};${currentPrice.toFixed()};${nextPrices
        .map((p) => p.toFixed())
        .join(";")};${divs.join(";")}`
    );
  }
}

main();
