import { CollateralizedPosition } from '../types/CollateralizedPosition';
import {PublicKey} from "@solana/web3.js";
import {useCallback, useEffect, useState} from "react";
import {getObligation} from "../larix-api/provider/obligationProvider";
import {getLendingReserve} from "../larix-api/provider/lendingReserveProvider";
import {Detail, ObligationCollateral, ObligationLiquidity, Reserve} from "../larix-api/models";
import {getInterest} from "../larix-api/utils/rateModel";
import {getUtilizationRate} from "../larix-api/utils/calculateAllMine";
import { eX } from '../larix-api/utils/helpers';
import BigNumber from 'bignumber.js';


export const useCollateralizedPosition = (pubkey: PublicKey | null) => {
    const [collateralizedPositions, setCollateralizedPositions] = useState([] as CollateralizedPosition[]);

    const getInterestAndUtilization = (reserve: Detail<Reserve>) => {
        const {compoundBorrowInterestArray,compoundSupplyInterestArray} = getInterest(reserve);
        const utilizationRate = getUtilizationRate(reserve.info)
        let borrowApy = 0;
        let depositApy = 0;
        compoundBorrowInterestArray.forEach(b => {
            let round = Math.ceil((utilizationRate.toNumber() * 100)) / 100
            if (b[0] === round) borrowApy = b[1]
        });
        compoundSupplyInterestArray.forEach(b => {
            let round = Math.ceil((utilizationRate.toNumber() * 100)) / 100
            if (b[0] === round) depositApy = b[1]
        });
        return {utilizationRate, borrowApy, depositApy}
    }


    const getPositions = useCallback(async () => {
        if (pubkey) {
            const larixObligations = await getObligation(pubkey);
            const lendingReserves = await getLendingReserve();
            larixObligations.forEach(obligation => {
                obligation.info.deposits.forEach(deposit => {
                    let reserve: Detail<Reserve> = {} as Detail<Reserve>;
                    lendingReserves.forEach(res => {
                        if (res.pubkey.equals(deposit.depositReserve)){
                           reserve = res;
                        }
                    })
                    const {borrowApy, depositApy} = getInterestAndUtilization(reserve);
                    const cp: CollateralizedPosition = {
                        platform: "Larix", 
                        amount: eX(deposit.depositedAmount.toNumber(), -reserve.info.liquidity.mintDecimals).toNumber(),
                        mint: reserve?.info.collateral.mintPubkey.toString(),
                        borrowApy, 
                        depositApy, 
                        supplied: true
                    }
                    setCollateralizedPositions((prev) => [...prev, cp])
                })

                obligation.info.borrows.forEach(borrow => {
                    let borrowReserve: Detail<Reserve> = {} as Detail<Reserve>;
                    lendingReserves.forEach(res => {
                        if (res.pubkey.equals(borrow.borrowReserve)){
                            borrowReserve = res;
                        }
                    })
                    const {borrowApy, depositApy} = getInterestAndUtilization(borrowReserve);
                    let amount = eX(borrow.borrowedAmountWads.toString(),-18)
                    const cp: CollateralizedPosition = {
                        platform: "Larix", 
                        amount: amount.shiftedBy(-borrowReserve.info.liquidity.mintDecimals).toNumber(),
                        mint: borrowReserve.info.liquidity.mintPubkey.toString(),
                        borrowApy,
                        depositApy, 
                        supplied: false
                    }
                    setCollateralizedPositions((prev) => [...prev, cp])
                })
            })
        }
    }, [pubkey])

    useEffect(() => {
        getPositions()
    }, [getPositions])

    return {
        collateralizedPositions,
    }
}
