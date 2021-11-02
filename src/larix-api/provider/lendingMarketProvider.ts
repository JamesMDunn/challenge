import {LendingMarket, LendingMarketParser,Detail} from "../models";
import {getConnection} from "../context/connection";
import {LENDING_ID, LENDING_MARKET} from "../utils/ids";
let lendingMarket:Detail<LendingMarket>;
export async function getLendingMarket():Promise<Detail<LendingMarket>>{
    if (lendingMarket !== undefined){return lendingMarket}

    const connection = await getConnection()
    const lendingAccountInfo = await connection.getAccountInfo(LENDING_ID);
    if (lendingAccountInfo == null){
        throw new Error("lendingAccountInfo is null")
    }
    lendingMarket = LendingMarketParser(LENDING_ID,lendingAccountInfo)
    return lendingMarket
}
export function getLendingMarketLocal():Detail<LendingMarket>{
    return LENDING_MARKET
}
