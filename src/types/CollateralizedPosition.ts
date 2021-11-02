export type CollateralizedPosition = {
    //the name of the lending platform
    platform: string;
    //the mint address of the token
    mint: string;
    //true when lending the token, false when borrowing the token
    supplied: boolean;
    //the amount being supplied, or borrowed
    amount: number;
    //the compounded borrow interest rate per year as a percentage
    borrowApy: number;
    //the compounded deposit interest rate per year as a percentage
    depositApy: number;
}
