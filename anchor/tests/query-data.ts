import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Voting } from "../target/types/voting";

describe("查询投票数据", () => {
  // 配置提供者
  anchor.setProvider(anchor.AnchorProvider.env());
  
  const program = anchor.workspace.Voting as Program<Voting>;

  it("查看所有已创建的投票", async () => {
    try {
      // 获取所有 Poll 账户
      const allPolls = await program.account.poll.all();
      
      console.log(`\n=== 找到 ${allPolls.length} 个投票 ===\n`);
      
      allPolls.forEach((poll, index) => {
        console.log(`投票 ${index + 1}:`);
        console.log(`  地址: ${poll.publicKey.toString()}`);
        console.log(`  投票ID: ${poll.account.pollId.toString()}`);
        console.log(`  描述: ${poll.account.description}`);
        console.log(`  开始时间: ${new Date(poll.account.pollStart.toNumber() * 1000)}`);
        console.log(`  结束时间: ${new Date(poll.account.pollEnd.toNumber() * 1000)}`);
        console.log(`  候选人数量: ${poll.account.candidateAmount.toString()}`);
        console.log(`  ---`);
      });
      
    } catch (error) {
      console.error("查询失败:", error);
    }
  });

  it("查询特定投票ID的数据", async () => {
    // 查询投票ID为1的数据
    const pollId = new anchor.BN(1);
    
    // 生成PDA地址
    const [pollPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [pollId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    try {
      const pollAccount = await program.account.poll.fetch(pollPda);
      
      console.log(`\n=== 投票ID ${pollId.toString()} 详情 ===`);
      console.log(`PDA地址: ${pollPda.toString()}`);
      console.log(`投票ID: ${pollAccount.pollId.toString()}`);
      console.log(`描述: ${pollAccount.description}`);
      console.log(`开始时间: ${new Date(pollAccount.pollStart.toNumber() * 1000)}`);
      console.log(`结束时间: ${new Date(pollAccount.pollEnd.toNumber() * 1000)}`);
      console.log(`候选人数量: ${pollAccount.candidateAmount.toString()}`);
      
    } catch (error) {
      console.error(`投票ID ${pollId.toString()} 不存在或查询失败:`, error.message);
    }
  });

  it("检查账户余额和租金", async () => {
    const pollId = new anchor.BN(1);
    const [pollPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [pollId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    try {
      const connection = program.provider.connection;
      const accountInfo = await connection.getAccountInfo(pollPda);
      
      if (accountInfo) {
        console.log(`\n=== 账户 ${pollPda.toString()} 信息 ===`);
        console.log(`余额: ${accountInfo.lamports / anchor.web3.LAMPORTS_PER_SOL} SOL`);
        console.log(`数据长度: ${accountInfo.data.length} 字节`);
        console.log(`所有者: ${accountInfo.owner.toString()}`);
        console.log(`是否可执行: ${accountInfo.executable}`);
        console.log(`租金纪元: ${accountInfo.rentEpoch}`);
      } else {
        console.log(`账户 ${pollPda.toString()} 不存在`);
      }
    } catch (error) {
      console.error("查询账户信息失败:", error);
    }
  });
}); 