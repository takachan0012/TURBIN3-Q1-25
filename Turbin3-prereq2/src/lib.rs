#[cfg(test)]
mod programs;
mod tests {
    #[test]
    fn submit_prereq(){
        use crate::programs::Turbin3_prereq::{WbaPrereqProgram, CompleteArgs, UpdateArgs};
        use solana_client::rpc_client::RpcClient;
        use solana_sdk::{
            signature::{Keypair,Signer,read_keypair_file}
        };
        use solana_program::system_program;

        const RPC_URL: &str = "https://api.devnet.solana.com";
        let rpc_client = RpcClient::new(RPC_URL);
        let signer = read_keypair_file("Turbin3-wallet.json").expect("Couldn't find wallet file");

        let prereq = WbaPrereqProgram::derive_program_address(&[b"prereq",signer.pubkey().to_bytes().as_ref()]);
        let args = CompleteArgs{
            github:b"takachan0012".to_vec()
        };
        let blockhash = rpc_client.get_latest_blockhash().expect("Failed to get recent blockhash");
        let transaction = WbaPrereqProgram::complete(&[&signer.pubkey(), &prereq, &system_program::id()], &args, Some(&signer.pubkey()),&[&signer], blockhash);
        let signature = rpc_client.send_and_confirm_transaction(&transaction).expect("Failed to send transaction");
        println!("Success! check tx here: https://explorer.solana.com/tx/{}/?cluster=devnet",signature);
    }



    #[test]
    fn keygen(){
        use solana_sdk::{signature::{Keypair, Signer}, pubkey::Pubkey};
        let kp = Keypair::new();
        println!("You've generated a new solana Wallet {}", kp.pubkey().to_string());
        println!("");
        println!("To save your wallet, copy and paste the following into JSON file");
        println!("{:?}", kp.to_bytes());
    }
    #[test]
    fn airdrop(){
        use solana_client::rpc_client::RpcClient;
        use solana_sdk::{
            signature::{Keypair,Signer,read_keypair_file}
        };
        const RPC_URL: &str = "https://api.devnet.solana.com";
        let keypair = read_keypair_file("dev-wallet.json").expect("Couldn't find wallet file");
        let client = RpcClient::new(RPC_URL);
        match client.request_airdrop(&keypair.pubkey(), 2_000_000_000u64){
            Ok(s) => {
                println!("Success! check tx here:");
                println!("https://explorer.solana.com/tx/{}?cluster=devnet",s.to_string());
            }
            Err(e) => println!("Oops, something went wrong: {}", e.to_string()),
        }

    }
    #[test]
    fn transfer_sol(){
        use solana_client::rpc_client::RpcClient;
        use solana_program::{
            pubkey::Pubkey,
            system_instruction::transfer,
        };

        use solana_sdk::{
            message::Message,
            signature::{
                Keypair,Signer,read_keypair_file
            },
            transaction::Transaction
        };

        use std::str::FromStr;
        const RPC_URL: &str = "https://api.devnet.solana.com";
        //crate connection
        let rpc_client = RpcClient::new(RPC_URL);
        //Import keypair
        let keypair = read_keypair_file("dev-wallet.json").expect("Couldn't find wallet file");
        
        //get balancd of dev wallet
        let balance = rpc_client.get_balance(&keypair.pubkey()).expect("Failed to get balance");

        //define turbin3 wallet
        let to_pubkey = Pubkey::from_str("3L3tKRpA8H8pomsFJCnKTpoVffcVuZMQq8jfnudKmmab").unwrap();
        
        //get recent blockhash
        let recent_blockhash = rpc_client.get_latest_blockhash().expect("failed to get recent blockhash");

        //create test to calculate fees
        let message = Message::new_with_blockhash(&[transfer(&keypair.pubkey(), &to_pubkey, balance,)], Some(&keypair.pubkey()),&recent_blockhash);

        //calculate exact fee
        let fee = rpc_client.get_fee_for_message(&message).expect("Failed to get fee calculator");

        //sent sol to turbin3 wallet
        let transaction = Transaction::new_signed_with_payer(&[transfer(&keypair.pubkey(),&to_pubkey, balance-fee)], Some(&keypair.pubkey()), &vec![&keypair],recent_blockhash);

        let signature = rpc_client
        .send_and_confirm_transaction(&transaction)
        .expect("Failed to send transaction");
        
        println!("Success! check tx link here: https://explorer.solana.com/tx/{}/?cluster=devnet", signature);
    }

}
