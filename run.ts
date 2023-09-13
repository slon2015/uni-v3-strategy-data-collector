import { ethers } from "ethers";
import { config } from "./src/config";
import { calculateRsi, collectRsiInput } from "./src/rsi";

async function main() {
  const conf = config();
  const provider = new ethers.providers.JsonRpcProvider(conf.rpcUrl);

  const blockNumber = conf.blockNumber || (await provider.getBlockNumber());

  const input = await collectRsiInput(
    provider,
    blockNumber,
    conf.poolAddress,
    conf.intervals,
    conf.step,
    conf.decimals0,
    conf.decimals1
  );

  const result = calculateRsi(input);

  console.log(`RSI: ${result.rsi}%`);
}

main();
