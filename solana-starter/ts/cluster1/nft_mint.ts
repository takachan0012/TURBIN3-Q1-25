import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { createSignerFromKeypair, signerIdentity, generateSigner, percentAmount } from "@metaplex-foundation/umi"
import { createNft, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";

import wallet from "../Turbin3-wallet1.json"
import base58 from "bs58";
import path from "path";
import { readFile } from "fs/promises";

const RPC_ENDPOINT = "https://api.devnet.solana.com";
const umi = createUmi(RPC_ENDPOINT);

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const myKeypairSigner = createSignerFromKeypair(umi, keypair);
umi.use(signerIdentity(myKeypairSigner));
umi.use(mplTokenMetadata())

const mint = generateSigner(umi);

(async () => {
    const nftName = 'generug-metadata';
    const nftMetadataPath = path.resolve(__dirname,`../nft-link/${nftName}.txt`)
    const nftLink = await readFile(nftMetadataPath, 'utf-8');
    let tx = await createNft(umi,{
        mint: mint,
        name: 'Haiiru Code NFT',
        uri: nftLink,
        sellerFeeBasisPoints: percentAmount(1)
    })
    let result = await tx.sendAndConfirm(umi);
    const signature = base58.encode(result.signature);
    
    console.log(`Succesfully Minted! Check out your TX here:\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet`)

    console.log("Mint Address: ", mint.publicKey);
})();