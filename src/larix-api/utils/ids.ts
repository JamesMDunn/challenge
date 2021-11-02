import { PublicKey } from '@solana/web3.js';
import {Detail, LendingMarket} from "../models";


export const WRAPPED_SOL_MINT = new PublicKey(
  'So11111111111111111111111111111111111111112',
);
export const TOKEN_PROGRAM_ID = new PublicKey(
  'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
);

// 主网 test
// export const URL = "https://api.mainnet-beta.solana.com"
// export const LENDING_PROGRAM_ID = new PublicKey(
//     'BDBsJpBPWtMfTgxejekYCWUAJu1mvQshiwrKuTjdEeT3',
// );
// export const LENDING_ID = new PublicKey("DwKvvvwpEmSCf8jDdyACrE2fWDhEnqTtjH2MTfXSAfiq")//test
// export const RESERVE_IDS = [
//     new PublicKey("HdH6SqBqJ1xVpQw4eGVyrxNsVVFPDMgDfX4ZDwoB8RGh"),
//     new PublicKey("3D9EihuiHG4N9Sju5J2A8gg4QLtmMwKGiLHRWB8CkUtv"),
//     new PublicKey("3T29A2imfP2dSXLSf1ML7zq6sJ19hDaKcWr1TgKUXhnA"),
//     new PublicKey("HSSR3kBmK4yUKLfiLkexiHYqq4KDGRKDCxZzS5A69ZfR"),
//     new PublicKey("CjsAvz7io4BxSWoZSunExSccPxRsVvscCRwAKrMR1VxX"),
//     // new PublicKey("E9bUhF1p5VvgLX1iGuAgYWdDPKGY1Ma9rVhN6gDbHkhm"),
//     new PublicKey("2NJcGBQ71JiJCWF4AnDT3FvJfMNAuRhejbsoRu6rZmKm"),
//     new PublicKey("EH449z9H4rx8G5N4MRR3CVDDAm5MpspfVStJo6FShVoo")
// ]
// export const RESERVE_LARIX_ORACLES = [
//     new PublicKey("269apCw3MSNgFUeoW99hhAoAWyCArtDAAB39pzZYRdNx"),
//     new PublicKey("5ZBcBeaYKAo8iLtefsWCFWUmpTjgnBcLEjr4yHCCHr7E"),
//     new PublicKey("9Hsq93xKsqeUf9b6PkiNDyr79BWphXPgxJ3KUoT4uLni"),
//     new PublicKey("5KfiXEBkw745gSyEdmCJEbFEjVPqZCUDXgETycQrMA4n"),
//     new PublicKey("4b48cC9RJwmLxGSPZGgPSh2qdQfwqzsxp2AZRyAdtHSo"),
//     // new PublicKey("4b48cC9RJwmLxGSPZGgPSh2qdQfwqzsxp2AZRyAdtHSo"),
//     new PublicKey("14QSoduiLpjG74sN1CT5rLZPKafx5FaEgcFC2WRp2wK2"),
//     new PublicKey("41qU3QVbNvJGJHRYS8zfNUrPJBUPQNtQD4DgABuPCeVH")
// ]
// export const LENDING_MARKET =  {
//     pubkey: LENDING_ID,
//     account: {
//     },
//     info: {
//         mineSupply: new PublicKey("8s8j1j9v2rpbDfXGrJsuDJTcLcGF32xSARM3oF1wST5G"),
//         mineMint: new PublicKey("Lrxqnh6ZHKbGy3dcrCED43nsoLkM1LTzU2jRfWe8qUC")
//     },
// } as Detail<LendingMarket>;

// mainnet production

//
export const URL = "https://solana-api.projectserum.com"
//
export const WSSURL = "wss://api.larix.app"
export const LENDING_PROGRAM_ID = new PublicKey(
    '7Zb1bGi32pfsrBkzWdqd4dFhUXwp5Nybr1zuaEwN34hy',
);
export const LENDING_ID = new PublicKey("5geyZJdffDBNoMqEbogbPvdgH9ue7NREobtW8M3C1qfe")//test
export const RESERVE_IDS = [
    new PublicKey("DC832AzxQMGDaVLGiRQfRCkyXi6PUPjQyQfMbVRRjtKA"),
    new PublicKey("Emq1qT9MyyB5eHfftF5thYme84hoEwh4TCjm31K2Xxif"),
    new PublicKey("9oxCAYbaien8bqjhsGpfVGEV32GJyQ8fSRMsPzczHTEb"),
    new PublicKey("Egw1PCmsm3kAWnFtKFCJkTwi2EMfBi5P4Zfz6iURonFh"),
    new PublicKey("2RcrbkGNcfy9mbarLCCRYdW3hxph7pSbP38x35MR2Bjt"),
    new PublicKey("GaX5diaQz7imMTeNYs5LPAHX6Hq1vKtxjBYzLkjXipMh"),
    new PublicKey("AwL4nHEPDKL7GW91czV4dUAp72kAwMBq1kBvexUYDBMm"),
    new PublicKey("9xdoHwJr4tD2zj3QVpWrzafBKgLZUQWZ2UYPkqyAhQf6")
]
export const RESERVE_LARIX_ORACLES = [
    new PublicKey("269apCw3MSNgFUeoW99hhAoAWyCArtDAAB39pzZYRdNx"),
    new PublicKey("5ZBcBeaYKAo8iLtefsWCFWUmpTjgnBcLEjr4yHCCHr7E"),
    new PublicKey("9Hsq93xKsqeUf9b6PkiNDyr79BWphXPgxJ3KUoT4uLni"),
    new PublicKey("5KfiXEBkw745gSyEdmCJEbFEjVPqZCUDXgETycQrMA4n"),
    new PublicKey("4b48cC9RJwmLxGSPZGgPSh2qdQfwqzsxp2AZRyAdtHSo"),
    new PublicKey("4b48cC9RJwmLxGSPZGgPSh2qdQfwqzsxp2AZRyAdtHSo"),
    new PublicKey("14QSoduiLpjG74sN1CT5rLZPKafx5FaEgcFC2WRp2wK2"),
    new PublicKey("41qU3QVbNvJGJHRYS8zfNUrPJBUPQNtQD4DgABuPCeVH")
]
export const LENDING_MARKET =  {
    pubkey: LENDING_ID,
    account: {
    },
    info: {
        mineSupply: new PublicKey("HCUZ8TiRfFcXAwCMEeTrirfrGCB1jB2KAocTi1jbfHrd"),
        mineMint: new PublicKey("Lrxqnh6ZHKbGy3dcrCED43nsoLkM1LTzU2jRfWe8qUC")
    },
} as Detail<LendingMarket>;
export const RESERVE_NAMES = ["USDT","USDC","BTC","ETH","SOL","mSOL","FTT","SRM"]
export const RESERVE_FULLNAMES = ["USDT","USDC","Bitcoin","Ethereum","Solana","mSOL","FTT","Serum"]
export const RESERVE_AND_LARIX_ORACLE_IDS:PublicKey[] =[]
RESERVE_IDS.map((item)=>{
    RESERVE_AND_LARIX_ORACLE_IDS.push(item)
})
RESERVE_LARIX_ORACLES.map((item)=>{
    RESERVE_AND_LARIX_ORACLE_IDS.push(item)
})
export const LARIX_TOKEN = new PublicKey(
    "Lrxqnh6ZHKbGy3dcrCED43nsoLkM1LTzU2jRfWe8qUC"//test
)

