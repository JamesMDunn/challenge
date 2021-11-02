import {AccountInfo, Connection, PublicKey} from "@solana/web3.js";
import {TokenAccount, TokenAccountParser} from "../models";
import {getConnection} from "../context/connection";
import {ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID, u64} from "@solana/spl-token";
import {LENDING_PROGRAM_ID, WRAPPED_SOL_MINT} from "../utils/ids";

export async function getTokenAccounts(userAddress:PublicKey):Promise<Map<string,Array<TokenAccount>>>{
    const connection = await getConnection()
    const tokenAccountsMap = new Map<string,Array<TokenAccount>>()
    await Promise.all([
        getSolToken(connection,tokenAccountsMap,userAddress),
        getOtherToken(connection,tokenAccountsMap,userAddress),
    ])
    return tokenAccountsMap
}
async function getAllAccount(connection:Connection){
    const result = await connection.getProgramAccounts(LENDING_PROGRAM_ID)
    console.log(result)
}
async function getSolToken(connection:Connection,tokenAccountsMap:Map<string,Array<TokenAccount>>,userAddress:PublicKey){
    const userAccount = await connection.getAccountInfo(userAddress)
    if (userAccount!==null){
        tokenAccountsMap.set(WRAPPED_SOL_MINT.toString(),[{
            pubkey: userAddress,
            account:userAccount,
            info: {
                address: userAddress,
                mint: WRAPPED_SOL_MINT,
                owner: userAddress,
                amount: new u64(userAccount.lamports),
                delegate: null,
                delegatedAmount: new u64(0),
                isInitialized: true,
                isFrozen: false,
                isNative: true,
                rentExemptReserve: null,
                closeAuthority: null,
            }
        }])
    }
}
async function getOtherToken(connection:Connection,tokenAccountsMap:Map<string,Array<TokenAccount>>,userAddress:PublicKey){
    const accountsInfo = await connection.getTokenAccountsByOwner(userAddress,{
        programId: TOKEN_PROGRAM_ID
    })
    accountsInfo.value
        .map(function (item: { pubkey: PublicKey; account: AccountInfo<Buffer> }){
            const tokenAccount = TokenAccountParser(item.pubkey,item.account)
            if (tokenAccountsMap.has(tokenAccount.info.mint.toString())){
                const tokenAccounts = tokenAccountsMap.get(tokenAccount.info.mint.toString());
                if (tokenAccounts!=undefined){
                    tokenAccounts.push(tokenAccount)
                }
            } else {
                const tokenAccounts = new Array<TokenAccount>();

                tokenAccounts.push(tokenAccount)
                tokenAccountsMap.set(tokenAccount.info.mint.toString(),tokenAccounts)
            }
        })
    for (const tokenAccounts of tokenAccountsMap.values()){
        if (tokenAccounts.length>1){
            const associatedAccount = await Token.getAssociatedTokenAddress(ASSOCIATED_TOKEN_PROGRAM_ID,TOKEN_PROGRAM_ID,tokenAccounts[0].info.mint,userAddress)
            tokenAccounts.sort((a,b)=>{
                if (b.pubkey.equals(associatedAccount)){
                    return 1;
                } else if (a.pubkey.equals(associatedAccount)){
                    return -1;
                } else {
                    return b.info.amount.toNumber()-a.info.amount.toNumber()
                }
            })
        }
    }
}
