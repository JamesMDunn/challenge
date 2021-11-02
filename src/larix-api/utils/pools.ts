
import {PublicKey } from '@solana/web3.js';
// import { PoolInfo } from '../models';

const toPoolInfo = (item: any, program: PublicKey) => {
  return {
    pubkeys: {
      account: item.pubkey,
      program: program,
      mint: item.data.tokenPool,
      holdingMints: [] as PublicKey[],
      holdingAccounts: [item.data.tokenAccountA, item.data.tokenAccountB],
    },
    legacy: false,
    raw: item,
  } as any;
};

function estimateProceedsFromInput(
  inputQuantityInPool: number,
  proceedsQuantityInPool: number,
  inputAmount: number,
): number {
  return (
    (proceedsQuantityInPool * inputAmount) / (inputQuantityInPool + inputAmount)
  );
}

function estimateInputFromProceeds(
  inputQuantityInPool: number,
  proceedsQuantityInPool: number,
  proceedsAmount: number,
): number | string {
  if (proceedsAmount >= proceedsQuantityInPool) {
    return 'Not possible';
  }

  return (
    (inputQuantityInPool * proceedsAmount) /
    (proceedsQuantityInPool - proceedsAmount)
  );
}

export enum PoolOperation {
  Add,
  SwapGivenInput,
  SwapGivenProceeds,
}
