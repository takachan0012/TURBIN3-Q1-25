import wallet from "../Turbin3-wallet1.json"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { createSignerFromKeypair, signerIdentity } from "@metaplex-foundation/umi"
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys"
import path from "path"
import { writeFileSync } from "fs"
import { readFile } from "fs/promises"

// Create a devnet connection
const umi = createUmi('https://api.devnet.solana.com');

// new Hostname
const hostName = 'https://devnet.irys.xyz/';

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(irysUploader());
umi.use(signerIdentity(signer));

(async () => {
    try {
        const dirPath = path.resolve(__dirname, '../nft-link');
        const fromNftLink = 'generug';
        const nftLink = path.resolve(__dirname,`../nft-link/${fromNftLink}.txt`);
        // Follow this JSON structure
        // https://docs.metaplex.com/programs/token-metadata/changelog/v1.0#json-structure
        // https://developers.metaplex.com/token-metadata/token-standard

        const imageLInk = await readFile(nftLink,'utf-8');
        const metadata = {
            name: "haiirucode",
            description: "We'll be greater in the future",
            images: imageLInk ,
            attributes: [
                {trait_type: 'Tier', value: 'Legendary'}
            ],
        };
        let myUri = await umi.uploader.uploadJson(metadata);
        if(myUri){
            const pathFileName = path.join(dirPath,`${fromNftLink}-metadata.txt`);
            myUri= new URL(myUri).pathname.slice(1);
            writeFileSync(pathFileName,hostName+myUri);
        }
        console.log("Your metadata URI: ", myUri);
    }
    catch(error) {
        console.log("Oops.. Something went wrong", error);
    }
})();
