import "dotenv/config";
import { Keypair } from "@solana/web3.js";
import base58 from "bs58";
import * as fs from "fs";

const PRIVATE_KEY = process.env.PRIVATE_KEY ?? "";
const PUBLIC_KEY = process.env.PUBLIC_KEY ?? "";

const secret = base58.decode(PRIVATE_KEY);

//check if the pk is correct
const pair = Keypair.fromSecretKey(secret);

if(pair.publicKey.toString() == PUBLIC_KEY){
    fs.writeFileSync('./Turbin3-wallet1.json',JSON.stringify(Array.from(secret)));
};