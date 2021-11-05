import { CollateralizedPosition } from '../types/CollateralizedPosition';
import {PublicKey} from "@solana/web3.js";
import {useCallback, useEffect, useState} from "react";
import {getObligation} from "../larix-api/provider/obligationProvider";
import {getLendingReserve} from "../larix-api/provider/lendingReserveProvider";
import {Detail, Reserve} from "../larix-api/models";
import {getInterest} from "../larix-api/utils/rateModel";
import {getUtilizationRate} from "../larix-api/utils/calculateAllMine";
import { eX } from '../larix-api/utils/helpers';
import {getMining} from '../larix-api/provider/miningProvider'

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
            const userMines = await getMining(pubkey);
            const lendingReserveMap: Map<string, Detail<Reserve>>  = new Map();
            lendingReserves.forEach(reserve => lendingReserveMap.set(reserve.pubkey.toString(), reserve));

            userMines.forEach(mine => {
                mine.info.miningIndices.forEach(index => {
                    const reserve = lendingReserveMap.get(index.reserve.toString())
                    if(reserve){ 
                        const {borrowApy, depositApy} = getInterestAndUtilization(reserve);
                        const cp: CollateralizedPosition = {
                            platform: "Larix",
                            amount: eX(index.unCollLTokenAmount.toNumber(), -reserve.info.liquidity.mintDecimals).toNumber(),
                            mint: reserve.info.liquidity.mintPubkey.toString(),
                            borrowApy,
                            depositApy,
                            supplied: true,
                        }
                        setCollateralizedPositions((prev) => [...prev, cp])
                    }
                })
            })

            larixObligations.forEach(obligation => {
                obligation.info.deposits.forEach(deposit => {
                    const reserve = lendingReserveMap.get(deposit.depositReserve.toString())
                    if(reserve){
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
                    }
                })

                obligation.info.borrows.forEach(borrow => {
                    const borrowReserve = lendingReserveMap.get(borrow.borrowReserve.toString())
                    if(borrowReserve) {
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
                    }
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
