use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, MintTo};

declare_id!("7pm6UKwB7G8qhsR456XbLS25fiHxMcvXvxw4mVPHYZeY");

#[program]
pub mod token_minter {
    use super::*;

    pub fn initialize_mint(ctx: Context<InitializeMint>, token_name:String) -> Result<()> {
        msg!("Initializing Mint Token with Name: {}", token_name);
        Ok(())
    }

    pub fn mint_tokens(ctx: Context<MintTokens>, amount: u64) -> Result<()> {
        let cpi_accounts = MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.token_account.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        };

        let cpi_ctx = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);
        token::mint_to(cpi_ctx, amount)?;
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(token_name:String)]
pub struct InitializeMint<'info> {
    #[account(init, payer = authority, mint::decimals = 6, mint::authority = authority, seeds = [b"mint", authority.key().as_ref(), token_name.as_bytes()], bump)]
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct MintTokens<'info> {
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub token_account: Account<'info, TokenAccount>,
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}
