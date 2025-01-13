import { Connection, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import wallet from "./dev-wallet.json";

const keypair =  Keypair.fromSecretKey(new Uint8Array(wallet));
console.log(keypair.publicKey);
const connection = new Connection("https://api.devnet.solana.com");


(async () => {
    try{
        const txhash = await connection.requestAirdrop(keypair.publicKey, 2 * LAMPORTS_PER_SOL);
        console.log(`Success check Tx here: https://explorer.solana.com/tx/${txhash}?cluster=devnet`);
    }catch(e){
        console.error(`Oops, Somethng went wrong: ${e}`);
    }
})();