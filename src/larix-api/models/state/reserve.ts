import { AccountInfo, PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import * as BufferLayout from 'buffer-layout';
import * as Layout from '../../utils/layout';
import { LastUpdate, LastUpdateLayout } from './lastUpdate';
import {Detail, LendingMarketLayout} from "../";
import BigNumber from "bignumber.js";

export interface Reserve {
  version: number;
  lastUpdate: LastUpdate;
  lendingMarket: PublicKey;
  liquidity: ReserveLiquidity;
  collateral: ReserveCollateral;
  config: ReserveConfig;
  bonus:Bonus;
}

export interface ReserveLiquidity {
    name: string;
    mintPubkey: PublicKey;
    mintDecimals: number;
    supplyPubkey: PublicKey;
    feeReceiver: PublicKey;
    usePythOracle: boolean;
    oraclePubkey: PublicKey;
    larixOraclePubkey: PublicKey;
    availableAmount: BN;
    borrowedAmountWads: BN;
    cumulativeBorrowRateWads: BN;
    marketPrice: BN | BigNumber;
    ownerUnclaimed: BN;
    liquidityPrice: BigNumber;
    exchangeRate: BigNumber
}

export interface ReserveCollateral {
  mintPubkey: PublicKey;
  mintTotalSupply: BN;
  supplyPubkey: PublicKey;
}

export interface ReserveConfig {
  optimalUtilizationRate: number;
  loanToValueRatio: number;
  liquidationBonus: number;
  liquidationThreshold: number;
  minBorrowRate: number;
  optimalBorrowRate: number;
  maxBorrowRate: number;
  fees: {
    borrowFeeWad: BN;
    borrowInterestFeeWad:BN;
    flashLoanFeeWad:BN;
    hostFeePercentage: number;
  };
  depositPaused:boolean;
  borrowPaused:boolean;
  borrowYearCompoundedInterestRate:BigNumber,
  supplyYearCompoundedInterestRate:BigNumber,
  liquidationPaused:boolean
}
export interface Bonus{
    unCollSupply:PublicKey,
    lTokenMiningIndex:BN,
    borrowMiningIndex:BN,

    /**
     * 当前Reserve每个slot产出的Larix矿的数量，没0.4s一个Slot，该数的低6位为小数位
     */
    totalMiningSpeed:BN,
    kinkUtilRate:BN,
}
export const ReserveLayout: typeof BufferLayout.Structure = BufferLayout.struct(
  [
    BufferLayout.u8('version'),

    LastUpdateLayout,

    Layout.publicKey('lendingMarket'),

    BufferLayout.struct(
      [
        Layout.publicKey('mintPubkey'),
        BufferLayout.u8('mintDecimals'),
        Layout.publicKey('supplyPubkey'),
        Layout.publicKey('feeReceiver'),
        BufferLayout.u8("usePythOracle"),
        Layout.publicKey('oraclePubkey'),
          Layout.publicKey("larixOraclePubkey"),
        Layout.uint64('availableAmount'),
        Layout.uint128('borrowedAmountWads'),
        Layout.uint128('cumulativeBorrowRateWads'),
        Layout.uint128('marketPrice'),
          Layout.uint128('ownerUnclaimed'),
      ],
      'liquidity',
    ),

    BufferLayout.struct(
      [
        Layout.publicKey('mintPubkey'),
        Layout.uint64('mintTotalSupply'),
        Layout.publicKey('supplyPubkey'),
      ],
      'collateral'
    ),

    BufferLayout.struct(
      [
        BufferLayout.u8('optimalUtilizationRate'),
        BufferLayout.u8('loanToValueRatio'),
        BufferLayout.u8('liquidationBonus'),
        BufferLayout.u8('liquidationThreshold'),
        BufferLayout.u8('minBorrowRate'),
        BufferLayout.u8('optimalBorrowRate'),
        BufferLayout.u8('maxBorrowRate'),
        BufferLayout.struct(
          // TODO: fix flash loan fee wad
          [
              Layout.uint64('borrowFeeWad'),
              Layout.uint64('borrowInterestFeeWad'),
              Layout.uint64("flashLoanFeeWad"),
              BufferLayout.u8('hostFeePercentage'),
              BufferLayout.u8('hostFeeReceiverCount'),
              BufferLayout.blob(32*5,'hostFeeReceivers'),
          ],
          'fees',
        ),
        BufferLayout.u8("depositPaused"),
        BufferLayout.u8("borrowPaused"),
        BufferLayout.u8("liquidationPaused"),
      ],
      'config'
    ),
    BufferLayout.struct(
          [
              Layout.publicKey("unCollSupply"),
              Layout.uint128('lTokenMiningIndex'),
              Layout.uint128('borrowMiningIndex'),
              Layout.uint64("totalMiningSpeed"),
              Layout.uint64("kinkUtilRate"),
          ],
          'bonus'
      ),
    BufferLayout.u8("reentry"),
    BufferLayout.blob(248, 'padding'),
  ],
);
export const isReserve = (info: AccountInfo<Buffer>) => {
    return info.data.length === ReserveLayout.span;
};

export const ReserveParser = (pubkey: PublicKey, info: AccountInfo<Buffer>):Detail<Reserve> => {
  const buffer = Buffer.from(info.data);
  const reserve = ReserveLayout.decode(buffer) as Reserve;
  if (reserve.lastUpdate.slot.isZero()) {
    throw new Error("reserve.lastUpdate.slot.isZero()")
  }

  const details = {
    pubkey,
    account: {
      ...info,
    },
    info: reserve,
  } as Detail<Reserve>;

  return details;
};
