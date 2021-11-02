import {u64, MintInfo, MintLayout,TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
    AccountInfo,
    Connection,
    PublicKey,
} from "@solana/web3.js";
/**
 *
 * @param connection
 * @param pubKey
 */
export async function getAccountInfo(connection:Connection,userAddress:PublicKey):Promise<AccountInfo<Buffer> | null>{
    return await connection.getAccountInfo(userAddress);
}
