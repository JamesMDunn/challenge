import {Account, Connection, sendAndConfirmTransaction, Transaction, TransactionInstruction} from "@solana/web3.js";
import { WalletAdapter } from "@solana/wallet-adapter-base";
// import store from '../../store'
import {URL, WSSURL} from "../utils/ids";


let connection:Connection
let _wallet:WalletAdapter
export function setWallet(wallet:any){
    _wallet = wallet
}
export function getWallet(){
    return _wallet
}
export function getConnection():Connection{
    if (connection) {return connection}
    connection = new Connection(URL, {
        commitment:'recent',
        wsEndpoint: WSSURL
    });
    return connection;
}
export function updateConnection(url:string):void{
    connection = new Connection(url, {
        commitment:'recent',
        wsEndpoint: WSSURL
    });
}
export function useConnection():Connection{
    return connection
}
export const sendTransaction = async (
    connection: Connection,
    wallet: WalletAdapter,
    instructions: TransactionInstruction[],
    signers: Account[],
    awaitConfirmation = true
) => {
    if (!wallet?.publicKey) {
        throw new Error("Wallet is not connected");
    }

    let transaction = new Transaction();
    instructions.forEach((instruction) => transaction.add(instruction));
    transaction.recentBlockhash = (
        await connection.getRecentBlockhash("max")
    ).blockhash;
    transaction.setSigners(
        // fee payied by the wallet owner
        wallet.publicKey,
        ...signers.map((s) => s.publicKey)
    );
    if (signers.length > 0) {
        transaction.partialSign(...signers);
    }
    transaction = await wallet.signTransaction(transaction);
    try {
        transaction.serialize()
    } catch (e){
        console.error(e)
    }
    const rawTransaction = transaction.serialize();
    const options = {
        skipPreflight: true,
        commitment: "processed",
    };

    const txid = await connection.sendRawTransaction(rawTransaction, options);

    // TODO: 交易发出，UI反馈
    if (awaitConfirmation) {
        const status = (
            await connection.confirmTransaction(
                txid,
                "confirmed"
            )
        ).value;
        console.log("txid=",txid)

        if (status.err) {
            //@ts-ignore
            // store.commit('updateErrorContext',status.err?.InstructionError[1].Custom)
            console.log(status.err)
            throw new Error(status.err.toString())
        }
    }

    return txid;
};
