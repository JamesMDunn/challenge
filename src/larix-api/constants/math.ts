import BN from "bn.js";
import BigNumber from "bignumber.js";

export const TEN = new BN(10);
export const HALF_WAD = TEN.pow(new BN(18));
export const WAD = TEN.pow(new BN(18));
export const ZERO = new BN(0);
export const BIG_NUMBER_WAD = new BigNumber(WAD.toString())
