import {getConnection} from "../context/connection";
import {LENDING_PROGRAM_ID} from "../utils/ids";
import {Detail} from "../models"
import BufferLayout from "buffer-layout";

import {PublicKey} from "@solana/web3.js";
import {Mining, MiningLayout, MiningParser} from "../models/state/mining";
// import {Reserve} from "@/api/models/state/reserve";
// import store from "@/store";
// lendingMarket:PublicKey
export async function getMining(ownerAddress:PublicKey):Promise<Array<Detail<Mining>>>{
    // if (actionType==='autoFresh')
    // {
    //     const storeMining = store.state.market.allMining as Array<Detail<Mining>>
    //     return storeMining
    // }

    const connection = await getConnection()
    const accountInfos = await connection.getProgramAccounts(LENDING_PROGRAM_ID,{
        filters:[
            {
                dataSize: MiningLayout.span
            },
            {
                memcmp: {
                    offset: BufferLayout.u8('version').span,
                    /** data to match, as base-58 encoded string and limited to less than 129 bytes */
                    bytes: ownerAddress.toBase58()
                }
            }

        ]
    })
    const resultArray = new Array<Detail<Mining>>();
    accountInfos.map(function (item):any{
        const value = MiningParser(item.pubkey,item.account)
        resultArray.push(value)
        // if (value.info.lendingMarket.equals(lendingMarket)){
        //
        // }
    })
    return resultArray
}
