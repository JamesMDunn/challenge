import {getConnection} from "../context/connection";
import {LENDING_PROGRAM_ID} from "../utils/ids";
import { cloneDeep } from 'lodash';
import {
    Detail,
    Obligation,
    ObligationCollateral,
    ObligationLayout,
    ObligationLiquidity,
    ObligationParser,
    Reserve
} from "../models"
import BufferLayout from "buffer-layout";
import {LastUpdateLayout} from "../models/state/lastUpdate";
import {PublicKey} from "@solana/web3.js";
import BigNumber from "bignumber.js";
import {eX} from "../utils/helpers";

// @ts-ignore
export async function getObligation(ownerAddress:PublicKey):Promise<Array<Detail<Obligation>>>{
    // if (actionType==='autoFresh')
    // {
    //     const storeUserAllObligation = store.state.market.userAllObligation as Array<Detail<Obligation>>
    //     return storeUserAllObligation
    // }

    const connection = await getConnection()
    const accountInfos = await connection.getProgramAccounts(LENDING_PROGRAM_ID,{
        filters:[
            {
                dataSize: ObligationLayout.span
            },
            {
                memcmp: {
                    offset: BufferLayout.u8('version').span+LastUpdateLayout.span+32,
                    /** data to match, as base-58 encoded string and limited to less than 129 bytes */
                    bytes: ownerAddress.toBase58()
                }
             }

        ]
    })
    const resultArray = new Array<Detail<Obligation>>();
    accountInfos.map(function (item):any{
        const obligationParser = ObligationParser(item.pubkey,item.account)
        // console.log("obligationParser.info.borrows[0].borrowedAmountWads.toString()",eX(obligationParser.info.borrows[0].borrowedAmountWads.toString(),-18).toString())
        resultArray.push(obligationParser)
        // if (value.info.lendingMarket.equals(lendingMarketAddress)){
        //
        // }
    })
    const sortResultArray = resultArray.sort( ( a, b)=>{
        return b.pubkey.toString().localeCompare(a.pubkey.toString())
    })
    return sortResultArray
}
// 清算接口
export async function getObligations(lendingMarketAddress: PublicKey,reserveArray:Array<Detail<Reserve>>): Promise<Array<Detail<Obligation>>> {
    const connection = await getConnection();
    const allAccountInfos = await connection.getProgramAccounts(LENDING_PROGRAM_ID
        ,
        {
            filters:[
                {
                    dataSize: ObligationLayout.span
                }
            ]
        }
    );

    const resultArray = new Array<Detail<Obligation>>();
    // console.log("allAccountInfos.length=",allAccountInfos.length)
    allAccountInfos.map(function(item): any {
        const obligation = ObligationParser(item.pubkey, item.account);
        if (obligation.info.lendingMarket.equals(lendingMarketAddress)) {
            if (obligation.info.borrows.length ==0){
                return
            }
            let logoSource = 'n/a'
            obligation.info.depositedValueInBibNumber = new BigNumber(0)
            obligation.info.borrowLimitValueInBibNumber = new BigNumber(0)
            obligation.info.deposits.map((deposit)=>{
                reserveArray.map((reserve)=>{
                    if (deposit.depositReserve.equals(reserve.pubkey)){
                        deposit.depositedInTokenUnit = eX(deposit.depositedAmount.toString(),-reserve.info.liquidity.mintDecimals).div(reserve.info.liquidity.exchangeRate)
                        deposit.depositedMarketValue = deposit.depositedInTokenUnit.times(reserve.info.liquidity.liquidityPrice)

                        deposit.reserve = reserve
                        // try {
                        //     logoSource = require(`../../assets/coin/asset_${reserve.info.liquidity.name}.svg`);
                        // } catch (e) {
                        //     logoSource = require(`../../assets/coin/token.svg`);
                        // }
                        // @ts-ignore
                        deposit.reserve.logoSource = logoSource
                        obligation.info.depositedValueInBibNumber =  obligation.info.depositedValueInBibNumber.plus(deposit.depositedMarketValue)
                        obligation.info.borrowLimitValueInBibNumber = obligation.info.borrowLimitValueInBibNumber.plus(deposit.depositedMarketValue.times(new BigNumber(reserve.info.config.liquidationThreshold.toString())).div(100))
                    }
                })

            })
            obligation.info.borrowedValueInBigNumber = new BigNumber(0)
            obligation.info.borrows.map((borrow)=>{
                reserveArray.map((reserve)=>{
                    if (borrow.borrowReserve.equals(reserve.pubkey)){
                        const compoundedInterestRate = new BigNumber(reserve.info.liquidity.cumulativeBorrowRateWads.toString())
                            .div(new BigNumber(borrow.cumulativeBorrowRateWads.toString()))
                        borrow.borrowAmountValueInTokenUnit = compoundedInterestRate.times(eX(borrow.borrowedAmountWads.toString(),-18-reserve.info.liquidity.mintDecimals))
                        borrow.marketValueInBigNumber = borrow.borrowAmountValueInTokenUnit.times(reserve.info.liquidity.liquidityPrice)
                        borrow.reserve = reserve
                        obligation.info.borrowedValueInBigNumber =  obligation.info.borrowedValueInBigNumber.plus(borrow.marketValueInBigNumber)
                        // try {
                        //     logoSource = require(`../../assets/coin/asset_${reserve.info.liquidity.name}.svg`);
                        // } catch (e) {
                        //     logoSource = require(`../../assets/coin/token.svg`);
                        // }
                        // @ts-ignore
                        borrow.reserve.logoSource = logoSource
                    }
                })
            })

            const rate = obligation.info.borrowedValueInBigNumber.div(obligation.info.borrowLimitValueInBibNumber.isZero()?1:obligation.info.borrowLimitValueInBibNumber)

            if (obligation.info.deposits.length>0&&rate.isGreaterThan(0.9))
            {
                const beforeSortObligation = cloneDeep(obligation)

                const sortBorrows = beforeSortObligation.info.borrows.sort((b:any,a:any)=>{
                    return a.marketValueInBigNumber.minus(b.marketValueInBigNumber).toNumber()
                })
                const sortDeposits = beforeSortObligation.info.deposits.sort((b:any,a:any)=>{
                    return a.depositedMarketValue.minus(b.depositedMarketValue).toNumber()
                })

                obligation.info.sortBorrows = sortBorrows
                obligation.info.sortDeposits = sortDeposits
                obligation.info.debtRatio = rate
                resultArray.push(obligation);
            }
        }
    });
    return resultArray;
}
