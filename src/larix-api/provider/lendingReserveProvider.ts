import {Connection, PublicKey, SYSVAR_CLOCK_PUBKEY} from "@solana/web3.js";
import { Reserve, ReserveParser, Detail} from "../models";
import {getConnection} from "../context/connection";
import {RESERVE_AND_LARIX_ORACLE_IDS, RESERVE_IDS, RESERVE_LARIX_ORACLES, RESERVE_NAMES,RESERVE_FULLNAMES} from "../utils/ids";
import BN from "bn.js";
import BigNumber from "bignumber.js";
import {getMineRatio, getUtilizationRate} from "../utils/calculateAllMine";
import {BIG_NUMBER_WAD, ZERO} from "../constants";
import {SLOTS_PER_YEAR,REAL_SLOTS_PER_YEAR} from "../constants/utils";
import {BIG_NUMBER_ONE, BIG_NUMBER_ZERO, eX} from "../utils/helpers";
import {isMarketPrice, MarketPrice, PriceParser} from "../models/state/marketPrice";

let lastSlot:number = 0
let count = 0
export async function getLendingReserve(): Promise<Array<Detail<Reserve>>>{
    const reserveArrayInner = new Array<Detail<Reserve>>();
    const marketPriceArray = new Array<Detail<MarketPrice>>();
    const connection = await getConnection()
    // @ts-ignore
    const result = await Promise.all(
        [
            getSlot(connection),
            getAllLendingReserveAndMarketPrice(connection,reserveArrayInner),
            // getLendingReserveByKey(connection,RESERVE_IDS[0],RESERVE_NAMES[0],reserveArrayInner,marketPriceArray),
            // getMarketPrice(connection,0,reserveArrayInner,marketPriceArray),
            // getLendingReserveByKey(connection,RESERVE_IDS[1],RESERVE_NAMES[1],reserveArrayInner,marketPriceArray),
            // getMarketPrice(connection,1,reserveArrayInner,marketPriceArray),
            // getLendingReserveByKey(connection,RESERVE_IDS[2],RESERVE_NAMES[2],reserveArrayInner,marketPriceArray),
            // getMarketPrice(connection,2,reserveArrayInner,marketPriceArray),
            // getLendingReserveByKey(connection,RESERVE_IDS[3],RESERVE_NAMES[3],reserveArrayInner,marketPriceArray),
            // getMarketPrice(connection,3,reserveArrayInner,marketPriceArray),
            // getLendingReserveByKey(connection,RESERVE_IDS[4],RESERVE_NAMES[4],reserveArrayInner,marketPriceArray),
            // getMarketPrice(connection,4,reserveArrayInner,marketPriceArray),
        ]
        )
    ;
    lastSlot = lastSlot < result[0]?result[0]:lastSlot;
    const currentSlot = new BN(lastSlot)
    accrueInterest(reserveArrayInner,currentSlot)
    refreshIndex(reserveArrayInner,currentSlot)
    refreshExchangeRate(reserveArrayInner)
    return reserveArrayInner
}
function refreshExchangeRate(allReserve:Detail<Reserve>[]) {
    allReserve.map((reserve)=> {
        const info = reserve.info
        const decimals = info.liquidity.mintDecimals
        let totalBorrowedAmount = eX(info.liquidity.borrowedAmountWads.toString(), -18)
        if (totalBorrowedAmount.lt(BIG_NUMBER_ONE)) {
            totalBorrowedAmount = BIG_NUMBER_ZERO
        } else {
            totalBorrowedAmount = totalBorrowedAmount.div(10**decimals)
        }
        const totalLiquidityAmount = new BigNumber(eX(info.liquidity.availableAmount.toString(), -decimals)).plus(totalBorrowedAmount).minus(eX(info.liquidity.ownerUnclaimed.toString(), -18 - decimals))
        info.liquidity.liquidityPrice = eX(info.liquidity.marketPrice.toString() || "0", -18)
        const mintTotalSupply = eX(info.collateral.mintTotalSupply.toString(), -1 * Number(decimals))
        if (mintTotalSupply.isZero() || totalLiquidityAmount.isZero()) {
            info.liquidity.exchangeRate = BIG_NUMBER_ONE
        } else {
            info.liquidity.exchangeRate = mintTotalSupply.div(totalLiquidityAmount)
        }
    })
}
async function getAllLendingReserveAndMarketPrice(connection:Connection,reserveArrayInner:Array<Detail<Reserve>>){
    const accounts = await connection.getMultipleAccountsInfo(RESERVE_AND_LARIX_ORACLE_IDS)
    // @ts-ignore
    const reserveAccounts = accounts.slice(0,RESERVE_AND_LARIX_ORACLE_IDS.length/2)
    // @ts-ignore
    const marketPriceAccounts = accounts.slice(RESERVE_AND_LARIX_ORACLE_IDS.length/2,RESERVE_AND_LARIX_ORACLE_IDS.length)
    for (let i=0;i<reserveAccounts.length;i++){
        const reserveAccountInfo = reserveAccounts[i]
        const marketPriceAccountInfo = marketPriceAccounts[i]
        if (reserveAccountInfo!==null && marketPriceAccountInfo!==null){
            const reserve = ReserveParser(RESERVE_IDS[i],reserveAccountInfo)
            reserve.info.liquidity.name = RESERVE_NAMES[i]
            // @ts-ignore
            reserve.info.liquidity.fullName = RESERVE_FULLNAMES[i]
            // @ts-ignore
            // console.log("reserve.info.config.optimalUtilizationRate",reserve.info.config.optimalUtilizationRate.toString())
            // console.log("reserve.info.config.optimalBorrowRate",reserve.info.config.optimalBorrowRate.toString());
            // console.log("reserve.info.config.maxBorrowRate",reserve.info.config.maxBorrowRate.toString());
            // console.log("reserve.info.config.loanToValueRatio",reserve.info.config.loanToValueRatio.toString());
            // console.log("reserve.info.config.liquidationThreshold=",reserve.info.config.liquidationThreshold.toString());
            // console.log("reserve.info.liquidity.marketPrice=",reserve.info.liquidity.marketPrice.toString());
            const marketPrice = PriceParser(RESERVE_LARIX_ORACLES[i],marketPriceAccountInfo)
            // console.log("marketPrice.info.price",marketPrice.info.price.toString())
            reserve.info.liquidity.marketPrice = marketPrice.info.price.mul(
                new BN(10)
                    .pow(
                        new BN(18-marketPrice.info.expo)
                    )
            )
            if (count>RESERVE_NAMES.length)count = RESERVE_NAMES.length
            if (count<RESERVE_NAMES.length){
                count++
                console.log(RESERVE_NAMES[i],eX(marketPrice.info.price.toString(),-marketPrice.info.expo).toString())
            }
            // console.log(new BigNumber(marketPrice.info.price.toString()).div(10 ** (marketPrice.info.expo)).toString());
            // console.log("reserve.info.liquidity.marketPrice=",reserve.info.liquidity.marketPrice.toString());
            // console.log(new BigNumber(reserve.info.liquidity.marketPrice.toString()).div(10 ** (18-marketPrice.info.expo)).toString());
            reserveArrayInner.push(reserve)
        }
    }
    return 0
}
async function getSlot(connection:Connection){
    return await connection.getSlot()
}
async function getSlots(connection:Connection){
    const clockAccountInfo = await connection.getAccountInfo(SYSVAR_CLOCK_PUBKEY)
}
function refreshIndex(allReserve:Detail<Reserve>[],currentSlot:BN){
    allReserve.map((reserve)=>{
        const slotDiff = currentSlot.sub(reserve.info.lastUpdate.slot)
        const {lTokenMiningRatio,borrowMiningRatio} = getMineRatio(reserve.info)
        const slotDiffTotalMining = new BigNumber(reserve.info.bonus.totalMiningSpeed.toString()).times(new BigNumber(slotDiff.toString()))
        if (!lTokenMiningRatio.eq(0)){
            if (reserve.info.collateral.mintTotalSupply.cmp(ZERO)!==0){
                const plus = slotDiffTotalMining.times(lTokenMiningRatio).div(new BigNumber(reserve.info.collateral.mintTotalSupply.toString())).times(BIG_NUMBER_WAD)
                const newIndex = new BigNumber(reserve.info.bonus.lTokenMiningIndex.toString()).plus(
                    plus
                ).toString()

                // console.log('refreshIndex newIndex = ',newIndex.toString())
                reserve.info.bonus.lTokenMiningIndex = new BN(newIndex.split(".")[0])
            }

        }
        if (!borrowMiningRatio.eq(0)){
            if (reserve.info.liquidity.borrowedAmountWads.cmp(ZERO)!==0){
                const newIndex = new BigNumber(reserve.info.bonus.borrowMiningIndex.toString()).plus(
                    slotDiffTotalMining.times(borrowMiningRatio).div(new BigNumber(reserve.info.liquidity.borrowedAmountWads.toString()).div(BIG_NUMBER_WAD)).times(BIG_NUMBER_WAD)
                )
                reserve.info.bonus.borrowMiningIndex = new BN(newIndex.toFixed(0))
            }
        }
    })
}
function accrueInterest(allReserve:Detail<Reserve>[],currentSlot:BN){
    allReserve.map((reserve)=>{
        const slotDiff = currentSlot.sub(reserve.info.lastUpdate.slot)
        const utilizationRate = getUtilizationRate(reserve.info)
        // console.log(reserve.info.liquidity.name)
        // console.log("reserve.info.config.optimalUtilizationRate",reserve.info.config.optimalUtilizationRate.toString())
        // console.log("reserve.info.config.optimalBorrowRate",reserve.info.config.optimalBorrowRate.toString());
        // console.log("reserve.info.config.maxBorrowRate",reserve.info.config.maxBorrowRate.toString());
        // console.log("utilizationRate",utilizationRate.toString())
        const currentBorrowRate = getCurrentBorrowRate(reserve.info ,utilizationRate)
        // console.log("currentBorrowRate",currentBorrowRate.toString())
        const slotInterestRate = currentBorrowRate.div(SLOTS_PER_YEAR)
        const compoundedInterestRate = new BigNumber(slotInterestRate.plus(1).toNumber()**slotDiff.toNumber())

        // console.log("SLOTS_PER_YEAR",SLOTS_PER_YEAR.toString())
        reserve.info.config.borrowYearCompoundedInterestRate = new BigNumber(slotInterestRate.plus(1).toNumber()**REAL_SLOTS_PER_YEAR).minus(1)
        // console.log(" reserve.info.config.borrowYearCompoundedInterestRate=", reserve.info.config.borrowYearCompoundedInterestRate.toString())

        reserve.info.config.supplyYearCompoundedInterestRate = reserve.info.config.borrowYearCompoundedInterestRate.times(0.8).times(utilizationRate)
        // console.log("reserve.info.config.supplyYearCompoundedInterestRate=",reserve.info.config.supplyYearCompoundedInterestRate.toString())
        // console.log("\n")
        reserve.info.liquidity.cumulativeBorrowRateWads =
            new BN(new BigNumber(reserve.info.liquidity.cumulativeBorrowRateWads.toString()).times(compoundedInterestRate).toFixed(0))
        const newUnclaimed =
            new BN(
                new BigNumber(reserve.info.liquidity.borrowedAmountWads.toString())
                    .times(compoundedInterestRate.minus(1))
                    .times(
                        new BigNumber(reserve.info.config.fees.borrowInterestFeeWad.toString()).div(BIG_NUMBER_WAD))
                    .toFixed(0)
            )

        reserve.info.liquidity.ownerUnclaimed = reserve.info.liquidity.ownerUnclaimed.add(newUnclaimed)
        reserve.info.liquidity.borrowedAmountWads =
            new BN(new BigNumber(reserve.info.liquidity.borrowedAmountWads.toString()).times(compoundedInterestRate).toFixed(0))
    })
}

function getCurrentBorrowRate(reserve:Reserve,utilizationRate:BigNumber):BigNumber{

    const optimalUtilizationRate = new BigNumber(reserve.config.optimalUtilizationRate).div(100)
    const lowUtilization = utilizationRate.lt(optimalUtilizationRate)
    if (lowUtilization || optimalUtilizationRate.eq(1)){
        const normalizedRate = utilizationRate.div(optimalUtilizationRate)
        const minRate = new BigNumber(reserve.config.minBorrowRate).div(100)
        const rateRange = new BigNumber(reserve.config.optimalBorrowRate-reserve.config.minBorrowRate).div(100)
        return normalizedRate.times(rateRange).plus(minRate)
    } else {
        const normalizedRate = utilizationRate.minus(optimalUtilizationRate).div(new BigNumber(1).minus(optimalUtilizationRate))
        const minRate = reserve.config.optimalBorrowRate/100
        const rateRange = new BigNumber(reserve.config.maxBorrowRate-reserve.config.optimalBorrowRate).div(100)
        return normalizedRate.times(rateRange).plus(minRate)
    }
}

async function getLendingReserveByKey(connection:Connection,reserveKey:PublicKey,name:string,reserveArrayInner:Array<Detail<Reserve>>,marketPriceArray:Array<Detail<MarketPrice>>){
    const reserveAccountInfo = await connection.getAccountInfo(reserveKey)
    if (reserveAccountInfo==null){
        throw new Error("reserveAccountInfo is null")
    }
    // console.log("reserveAccountInfo",reserveAccountInfo)
    const reserve = ReserveParser(reserveKey,reserveAccountInfo)
    reserve.info.liquidity.name = name
    reserveArrayInner.push(reserve)
    marketPriceArray.map((marketPrice) => {
        if (reserve.info.liquidity.larixOraclePubkey.equals(marketPrice.pubkey)){
            reserve.info.liquidity.marketPrice = marketPrice.info.price.mul(
                new BN(10)
                    .pow(
                        new BN(18-marketPrice.info.expo)
                        // .sub(marketPrice.info.expo)
                    )
            )
        }
    })
    return 0
}
async function getMarketPrice(connection:Connection,index:number,reserveArrayInner:Array<Detail<Reserve>>,marketPriceArray:Array<Detail<MarketPrice>>){
    const marketPriceInfoInOracle = await connection.getAccountInfo(RESERVE_LARIX_ORACLES[index])
    if (marketPriceInfoInOracle==null){
        throw new Error("reserveAccountInfo is null")
    }
    const marketPrice = PriceParser(RESERVE_LARIX_ORACLES[index],marketPriceInfoInOracle)
    marketPriceArray.push(marketPrice)
    reserveArrayInner.map((reserve)=>{
        if (reserve.info.liquidity.larixOraclePubkey.equals(marketPrice.pubkey)){
            reserve.info.liquidity.marketPrice = marketPrice.info.price.mul(
                new BN(10)
                    .pow(
                        new BN(18-marketPrice.info.expo)
                    )
            )
        }
    })
    return 0
}

