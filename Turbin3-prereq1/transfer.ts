import "dotenv/config";
import { 
    Transaction, 
    SystemProgram, 
    Connection, 
    Keypair,
    sendAndConfirmTransaction, 
    PublicKey } from "@solana/web3.js";
import wallet from "./dev-wallet.json";

const public_key = process.env.PUBLIC_KEY ?? "";

//dev wallet
const from = Keypair.fromSecretKey(new Uint8Array(wallet));

//turbin3 address
const to = new PublicKey(public_key);
const connection = new Connection("https://api.devnet.solana.com");

(async () => {
    try{
        //get balance dev wallet
        const balance = await connection.getBalance(from.publicKey);

        //create test a tx to calculate fee
        const transaction = new Transaction().add(
            SystemProgram.transfer(
                {
                    fromPubkey: from.publicKey,
                    toPubkey: to,
                    lamports: balance
                }
            )
        );
        transaction.recentBlockhash = (await connection.getLatestBlockhash('confirmed')).blockhash;
        transaction.feePayer = from.publicKey;

        //calculate exact fee rate.
        const fee = (await connection.getFeeForMessage(transaction.compileMessage(), 'confirmed')).value || 0;

        //remove our tx intruction to replace it
        transaction.instructions.pop();

        //back with correct amount of lamports
        transaction.add(SystemProgram.transfer({
            fromPubkey: from.publicKey,
            toPubkey: to,
            lamports: balance - fee
        }));

        const signature = await sendAndConfirmTransaction(
            connection,
            transaction,
            [from]
        );

        console.log(`Success! Check out your TX here: https://explorer.solana.com/tx/${signature}?cluster=devnet`);
    }catch(e){
        console.error(`Oops, something went wrong: ${e}`);
    }
})();