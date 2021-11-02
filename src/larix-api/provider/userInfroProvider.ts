import {getConnection} from "../context/connection";
import {PublicKey} from "@solana/web3.js";

export async function getUserInfo(userAddress:PublicKey){
    const connection = await getConnection();
    const userInfo = await connection.getAccountInfo(userAddress)

}