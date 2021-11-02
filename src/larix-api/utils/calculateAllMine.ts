import {Detail, Obligation, Reserve} from "../models";
import {Mining} from "../models/state/mining";
import {WAD, BIG_NUMBER_WAD, ZERO} from "../constants";
import BigNumber from "bignumber.js";
import {BIG_NUMBER_ONE, BIG_NUMBER_ZERO, eX} from "./helpers";

export async function calculateAllMine(mining:Detail<Mining>|undefined, obligation:Detail<Obligation>, allReserve:Detail<Reserve>[]): Promise<BigNumber>{

    let allMine = new BigNumber(0);
    if (mining===undefined && obligation===undefined){
        return allMine
    }

    if (mining != undefined){
        allMine = allMine.plus(new BigNumber(mining.info.unclaimedMine.toString()))
        // console.log('puls1:',mining.info.unclaimedMine.toString())
        mining.info.miningIndices.map((item) => {
            allReserve.map((reserve) =>{

                //@ts-ignore
                if (item.reserve.equals(reserve.pubkey)){
                    // console.log('puls2:',reserve.info.bonus.lTokenMiningIndex.sub(item.index).mul(item.unCollLTokenAmount).toString())
                    allMine = allMine.plus(
                        new BigNumber(reserve.info.bonus.lTokenMiningIndex.sub(item.index).mul(item.unCollLTokenAmount).toString())
                    )
                }
            })
        })
    }
    if (obligation!=undefined){
        allMine = allMine.plus(new BigNumber(obligation.info.unclaimedMine.toString()))
        // console.log('puls3:',obligation.info.unclaimedMine.toString())
        obligation.info.deposits.map((item)=>{
            allReserve.map((reserve)=>{
                if (item.depositReserve.equals(reserve.pubkey)){
                    // console.log('puls4:',reserve.info.bonus.lTokenMiningIndex.sub(item.index).mul(item.depositedAmount).toString())
                    // console.log('lTokenMiningIndex=',reserve.info.bonus.lTokenMiningIndex.toString())
                    // console.log('index=',item.index.toString())
                    allMine = allMine.plus(
                        new BigNumber(reserve.info.bonus.lTokenMiningIndex.sub(item.index).mul(item.depositedAmount).toString())
                    )
                }
            })
        })
        obligation.info.borrows.map((item)=>{
            allReserve.map((reserve)=>{
                if (item.borrowReserve.equals(reserve.pubkey)){
                    allMine = allMine.plus(
                        new BigNumber(reserve.info.bonus.borrowMiningIndex.sub(item.index).mul(item.borrowedAmountWads.div(WAD)).toString())
                    )
                }
            })
        })
    }
    const result = allMine.div(BIG_NUMBER_WAD).div(1000000)
    // console.log("result=",result.toString())
    return result

}

/**
    存款方分配矿的比例，将结果除以10**18，就是百分数 (result/10**18) % 100
 * @param reserve
 */
//@ts-ignore
export function getMineRatio(reserve:Reserve):{lTokenMiningRatio:BigNumber,borrowMiningRatio:BigNumber}{
    return {lTokenMiningRatio:new BigNumber(0.9),borrowMiningRatio:new BigNumber(0.1)}
   if (reserve.collateral.mintTotalSupply.eq(ZERO)){
       return  {lTokenMiningRatio:BIG_NUMBER_ZERO,borrowMiningRatio:BIG_NUMBER_ZERO}
   }
    if (reserve.liquidity.borrowedAmountWads.lt(WAD)){
        return {lTokenMiningRatio:BIG_NUMBER_ONE,borrowMiningRatio:BIG_NUMBER_ZERO}
    }
    const utilizationRate = getUtilizationRate(reserve);
    const kinkRate = new BigNumber(reserve.bonus.kinkUtilRate.toString()).div(10000)
    if (utilizationRate<kinkRate){
        const normalizedRate = utilizationRate.div(kinkRate)
        const lTokenMiningRatio = normalizedRate.times(0.5)
        return {lTokenMiningRatio,borrowMiningRatio:new BigNumber(1).minus(lTokenMiningRatio)}
    } else {
        const normalizedRate = utilizationRate.minus(kinkRate).div(1-kinkRate.toNumber())
        const minRate = 0.5
        const rateRage = 1-0.5
        const lTokenMiningRatio = normalizedRate.times(rateRage).plus(minRate);
        return {lTokenMiningRatio,borrowMiningRatio:new BigNumber(1).minus(lTokenMiningRatio)}
    }
}
export function getUtilizationRate(reserve:Reserve):BigNumber{
    const borrowedAmount = new BigNumber(reserve.liquidity.borrowedAmountWads.toString())
        .div(BIG_NUMBER_WAD);
    const totalSupply = new BigNumber(reserve.liquidity.availableAmount.toString()).plus(borrowedAmount).minus(eX(reserve.liquidity.ownerUnclaimed.toString(),-18));
    if (totalSupply.eq(0)){
        return BIG_NUMBER_ZERO
    }
    if (reserve.liquidity.borrowedAmountWads.lt(WAD)){
        return BIG_NUMBER_ZERO
    }
    if (borrowedAmount.gt(totalSupply)){
        return BIG_NUMBER_ONE
    } else {
        return borrowedAmount.div(
            totalSupply
        )
    }

}
