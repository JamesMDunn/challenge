import BN from 'bn.js';

export const U64_MAX = new BN("ffffffffffffffff","hex")

export const SLOTS_PER_YEAR = 1000/400  * 60 * 60 * 24 * 365
// 实际每个SLOTS时长（毫秒）
export const REAL_SLOTS_TIME = 500
export const REAL_SLOTS_PER_YEAR = 1000/REAL_SLOTS_TIME  * 60 * 60 * 24 * 365
export const REAL_SLOTS_PER_DAY = 1000/REAL_SLOTS_TIME * 60 * 60 * 24
export const IEO_LARIX_AMOUNT = 30666666.7
