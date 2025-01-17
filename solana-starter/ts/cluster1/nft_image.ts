import wallet from "../Turbin3-wallet1.json"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { createGenericFile, createSignerFromKeypair, signerIdentity } from "@metaplex-foundation/umi"
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys"
import { readFile } from "fs/promises"
import path from "path"
import { existsSync, mkdirSync, writeFileSync } from "fs"

// Create a devnet connection
const umi = createUmi('https://api.devnet.solana.com');

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(irysUploader());
umi.use(signerIdentity(signer));

(async () => {
    try {
        //1. Load image
        const imageName = 'generug';
        const dirPath = path.resolve(__dirname,'../nft-link');
        if(!existsSync(dirPath)){
            mkdirSync(dirPath, {recursive:true});
        }
        const filePath = path.resolve(__dirname, `../images/${imageName}.png`);
        const imageBuffer = await readFile(filePath)
        //2. Convert image to generic file.
        const image = createGenericFile(imageBuffer,imageName,{
            contentType: 'image/png'
        })
        //3. Upload image
        const [myUri] = await umi.uploader.upload([image]);
        if(myUri){
            const joinPath = path.join(dirPath, `${imageName}.txt`)
            const newURL = new URL(myUri).pathname.slice(1);
            writeFileSync(joinPath, `https://devnet.irys.xyz/${newURL}`);
        }
        console.log("Your image URI: ", myUri);
    }
    catch(error) {
        console.log("Oops.. Something went wrong", error);
    }
})();
