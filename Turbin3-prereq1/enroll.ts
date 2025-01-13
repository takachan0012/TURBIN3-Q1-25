import { 
    Connection,
    Keypair,
    PublicKey
} from "@solana/web3.js";
import { 
    Program,
    Wallet,
    AnchorProvider
} from "@coral-xyz/anchor";
import {IDL, Turbin3Prereq} from "./program/Turbin3_prereq";
import wallet from "./Turbin3-wallet.json";

const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));
const connection = new Connection("https://api.devnet.solana.com");
const github = Buffer.from("takachan0012", "utf8");

//Create anchor provider
const provider = new AnchorProvider(connection, new Wallet(keypair), {
    commitment: "confirmed"
});

//Create program
const program: Program<Turbin3Prereq> = new Program(IDL, provider);

//Create PDA enrollment account
const enrollment_seeds = [Buffer.from("prereq"), keypair.publicKey.toBuffer()];
const [enrollment_key, _bump] = PublicKey.findProgramAddressSync(enrollment_seeds, program.programId);

//Execute enrollment transaction
(async () => {
    try{
        const txhash = await program.methods.complete(github).accounts({
            signer: keypair.publicKey,
        }).signers(
            [keypair]
        ).rpc();
        console.log(`Success! Tx here: https://explorer.solana.com/tx/${txhash}?cluster=devnet`);
    }catch(e){
        console.error(`Oops, something went wrong: ${e}`);
    }
})();


