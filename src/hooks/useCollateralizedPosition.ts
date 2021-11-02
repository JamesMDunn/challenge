import { CollateralizedPosition } from '../types/CollateralizedPosition';
import {PublicKey} from "@solana/web3.js";
import {useCallback, useEffect, useState} from "react";
import {getObligation} from "../larix-api/provider/obligationProvider";
import {LAMPORTS_PER_SOL} from "../constants";
import BN from "bn.js";
import {getLendingReserve} from "../larix-api/provider/lendingReserveProvider";
import {Detail, Reserve} from "../larix-api/models";
import {getInterest} from "../larix-api/utils/rateModel";
import {getUtilizationRate} from "../larix-api/utils/calculateAllMine";
import { eX } from '../larix-api/utils/helpers';


export const useCollateralizedPosition = (pubkey: PublicKey | null) => {
    const [collateralizedPositions, setCollateralizedPositions] = useState([] as CollateralizedPosition[]);

    const getPositions = useCallback(async () => {
        console.log("got here")
        if (pubkey) {
            const larixObligations = await getObligation(pubkey);
            const lendingReserves = await getLendingReserve();
            console.log({larixObligations, lendingReserves})
            larixObligations.forEach(obligation => {
            console.log({obligation})
            // console.log(obligation.pubkey.toString())
            // console.log(obligation.info.deposits[0].depositedAmount.toString())
            // console.log(obligation.info.borrows[0].borrowedAmountWads.toString())
                obligation.info.deposits.forEach(deposit => {
                    let reserve: Detail<Reserve> = {} as Detail<Reserve>;
                    lendingReserves.forEach(res => {
                        if (res.pubkey.equals(deposit.depositReserve)){
                           reserve = res;
                        }
                    })
                    const {compoundBorrowInterestArray,compoundSupplyInterestArray} = getInterest(reserve);
                    const utilizationRate = getUtilizationRate(reserve.info)
                    let borrowApy = 0;
                    let depositApy = 0;
                    compoundBorrowInterestArray.forEach(b => {
                        let round = Math.ceil((utilizationRate.toNumber() * 100)) / 100
                        console.log(b[0], round)
                        if (b[0] === round) borrowApy = b[1]
                    });
                    compoundSupplyInterestArray.forEach(b => {
                        let round = Math.ceil((utilizationRate.toNumber() * 100)) / 100
                        console.log(b[0], round)
                        if (b[0] === round) depositApy = b[1]
                    });
                    const cp: CollateralizedPosition = {
                        platform: "Larix", //TODO not sure if this is hardcoded?
                        amount: deposit.depositedAmount.toNumber() / 1000000000,
                        mint: reserve?.info.collateral.mintPubkey.toString(),
                        borrowApy, //TODO
                        depositApy, //TODO
                        supplied: true //TODO
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
                    console.log({borrowReserve, borrow})
                    let borrowApy = 0;
                    let depositApy = 0;
                    const utilizationRate = getUtilizationRate(borrowReserve.info)

                    let amount = eX(borrow.borrowedAmountWads.toString(),-18)
                    const {compoundBorrowInterestArray,compoundSupplyInterestArray} = getInterest(borrowReserve);
                    console.log({compoundBorrowInterestArray,compoundSupplyInterestArray})
                    compoundBorrowInterestArray.forEach(b => {
                        let round = Math.ceil((utilizationRate.toNumber() * 100)) / 100
                        console.log(b[0], round)
                        if (b[0] === round) borrowApy = b[1]
                    });
                    compoundSupplyInterestArray.forEach(b => {
                        let round = Math.ceil((utilizationRate.toNumber() * 100)) / 100
                        console.log(b[0], round)
                        if (b[0] === round) depositApy = b[1]
                    });
                    const cp: CollateralizedPosition = {
                        platform: "Larix", 
                        amount: amount.shiftedBy(-borrowReserve.info.liquidity.mintDecimals).toNumber(),
                        mint: borrowReserve.info.liquidity.mintPubkey.toString(),
                        borrowApy,
                        depositApy, 
                        supplied: false
                    }
                    console.log(borrowReserve.info.liquidity.mintDecimals)
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
