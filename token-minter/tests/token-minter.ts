import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import {  TOKEN_PROGRAM_ID, getAssociatedTokenAddress, getAccount, createAssociatedTokenAccount} from "@solana/spl-token";
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL} from "@solana/web3.js";
import { TokenMinter } from "../target/types/token_minter";

describe("Token Minter Program", () => {
  // Initialize the provider and program
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.TokenMinter as Program<TokenMinter>;

  let mint: PublicKey;
  let mintBump: number;
  let tokenAccount: PublicKey;
  const payer = provider.wallet as anchor.Wallet;
  const tokenName = "TokenD";
  
  [mint,mintBump] = PublicKey.findProgramAddressSync(
      [Buffer.from('mint'), payer.publicKey.toBuffer(), Buffer.from(tokenName)],
      program.programId
    )

  it('Initialize Mint', async () => {
   const txhash =  await program.methods.initializeMint(tokenName)
    .accounts({
      mint,
      authority: payer.publicKey,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID
    })
    .rpc();
    console.log("Initialize txHash: ",txhash);
  })

  it("Mint Tokens", async () => {
    tokenAccount = await getAssociatedTokenAddress(mint, payer.publicKey);

    // Ensure the associated token account exists and is initialized
    try {
      await getAccount(provider.connection, tokenAccount);
    } catch (error) {
      console.log("Creating associated token account...");
      await createAssociatedTokenAccount(
        provider.connection, // Connection
        payer.payer, // Payer
        mint, // Mint
        payer.publicKey // Token Owner
      )
    }

    const amount = new anchor.BN(1*LAMPORTS_PER_SOL); // 1000 tokens

    const tx = await program.methods
      .mintTokens(amount)
      .accounts({
        mint,
        tokenAccount,
        authority: payer.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    console.log("Mint Token Hash:", tx);
    });
});
