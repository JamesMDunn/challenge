import BigNumber from "bignumber.js";
import {Detail, Reserve} from "../models";
import { SLOTS_PER_YEAR ,REAL_SLOTS_PER_YEAR} from "../constants/utils";
const UtilizationRateArray =  [0.00,
    0.01,
    0.02,
    0.03,
    0.04,
    0.05,
    0.06,
    0.07,
    0.08,
    0.09,
    0.10,
    0.11,
    0.12,
    0.13,
    0.14,
    0.15,
    0.16,
    0.17,
    0.18,
    0.19,
    0.20,
    0.21,
    0.22,
    0.23,
    0.24,
    0.25,
    0.26,
    0.27,
    0.28,
    0.29,
    0.30,
    0.31,
    0.32,
    0.33,
    0.34,
    0.35,
    0.36,
    0.37,
    0.38,
    0.39,
    0.40,
    0.41,
    0.42,
    0.43,
    0.44,
    0.45,
    0.46,
    0.47,
    0.48,
    0.49,
    0.50,
    0.51,
    0.52,
    0.53,
    0.54,
    0.55,
    0.56,
    0.57,
    0.58,
    0.59,
    0.60,
    0.61,
    0.62,
    0.63,
    0.64,
    0.65,
    0.66,
    0.67,
    0.68,
    0.69,
    0.70,
    0.71,
    0.72,
    0.73,
    0.74,
    0.75,
    0.76,
    0.77,
    0.78,
    0.79,
    0.80,
    0.81,
    0.82,
    0.83,
    0.84,
    0.85,
    0.86,
    0.87,
    0.88,
    0.89,
    0.90,
    0.91,
    0.92,
    0.93,
    0.94,
    0.95,
    0.96,
    0.97,
    0.98,
    0.99,
    1.00,]

export function getInterest(reserveDetail:Detail<Reserve>){
    //要除100
    const k1 = (reserveDetail.info.config.optimalBorrowRate/100-0.02)/(reserveDetail.info.config.optimalUtilizationRate/100)
    const k2 = (reserveDetail.info.config.maxBorrowRate/100-reserveDetail.info.config.optimalBorrowRate/100)/(1-reserveDetail.info.config.optimalUtilizationRate/100)
    const b1 = 0.02
    // console.log(reserveDetail.info.liquidity.name,'斜率k1',k1,'斜率k2',k2)
    const b2 = (reserveDetail.info.config.optimalBorrowRate/100 - k2*reserveDetail.info.config.optimalUtilizationRate/100)
    // console.log('常数b2',b2)
    const compoundBorrowInterestArray = calcCompoundBorrowInterest(k1 ,b1,k2,b2,reserveDetail.info.config.optimalUtilizationRate ,UtilizationRateArray)
    const compoundSupplyInterestArray = calcCompoundSupplyInterest(compoundBorrowInterestArray,UtilizationRateArray)
    return {UtilizationRateArray,compoundBorrowInterestArray,compoundSupplyInterestArray}
}
export function calcCompoundBorrowInterest(k1 :number, b1 :number ,k2 :number ,b2:number ,optimalUtilizationRate :number,utilizationRateArray:number[]){
    const compoundBorrowInterestArray = []

    for (let i = 0;i<utilizationRateArray.length;i++){
        if (utilizationRateArray[i]<optimalUtilizationRate/100)
        {
            const borrowInterest = k1*(utilizationRateArray[i])+b1
            const compoundBorrowInterest = ((borrowInterest/SLOTS_PER_YEAR)+1)**(REAL_SLOTS_PER_YEAR)
            compoundBorrowInterestArray.push([utilizationRateArray[i],(compoundBorrowInterest-1)*100])
        }
        else {
            const borrowInterest = k2*(utilizationRateArray[i])+b2
            const compoundBorrowInterest = ((borrowInterest/SLOTS_PER_YEAR)+1)**(REAL_SLOTS_PER_YEAR)
            compoundBorrowInterestArray.push([utilizationRateArray[i],(compoundBorrowInterest-1)*100])
        }
    }
    return compoundBorrowInterestArray
}
export function calcCompoundSupplyInterest(compoundBorrowInterestArray:number[][],utilizationRateArray:number[]){
    const compoundSupplyInterestArray = []
    for (let i = 0;i<compoundBorrowInterestArray.length;i++)
    {
        compoundSupplyInterestArray.push([utilizationRateArray[i],compoundBorrowInterestArray[i][1]*0.8*utilizationRateArray[i]])
    }
    return compoundSupplyInterestArray
}
