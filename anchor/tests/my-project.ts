import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Voting } from "../target/types/voting";
import { expect } from "chai";

const programId = "5wGZjoLTxpGPJrR3zeN9sG9xBqdEBRUmF4NvoGLfVsJU";

describe("voting", () => {
  // 配置提供者
  anchor.setProvider(anchor.AnchorProvider.env());
  
  const program = anchor.workspace.Voting as Program<Voting>;
  const provider = anchor.getProvider();
  const pollCreator = provider.wallet.publicKey;
  it("Initialize Poll", async () => {
    // 测试数据
    const pollId = new anchor.BN(1);
    const description = "Which language?";
    const pollStart = new anchor.BN(Date.now() / 1000); // 当前时间戳
    const pollEnd = new anchor.BN(Date.now() / 1000 + 86400); // 24小时后

    // 生成PDA账户地址
    const [pollPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [pollId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    try {
      // 调用initialize_poll指令
      const tx = await program.methods
        .initializePoll(pollId, 
          description, pollStart, pollEnd)
        .accountsPartial({
          pollCreator: provider.wallet.publicKey,
          poll: pollPda,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      console.log("交易签名:", tx);

      // 获取创建的poll账户数据
      const pollAccount = await program.account.poll.fetch(pollPda);

      // 验证数据
      expect(pollAccount.pollId.toString()).to.equal(pollId.toString());
      expect(pollAccount.description).to.equal(description);
      expect(pollAccount.pollStart.toString()).to.equal(pollStart.toString());
      expect(pollAccount.pollEnd.toString()).to.equal(pollEnd.toString());
      expect(pollAccount.candidateAmount.toString()).to.equal("0");

      console.log("投票创建成功!");
      console.log("投票ID:", pollAccount.pollId.toString());
      console.log("描述:", pollAccount.description);
      console.log("开始时间:", new Date(pollAccount.pollStart.toNumber() * 1000));
      console.log("结束时间:", new Date(pollAccount.pollEnd.toNumber() * 1000));
      console.log("候选人数量:", pollAccount.candidateAmount.toString());
      // 打印投票创建人
      console.log("投票创建人:",pollCreator.toString());
    } catch (error) {
      console.error("测试失败:", error);
      throw error;
    }
  });

  it("Initialize Poll with different parameters", async () => {
    // 测试不同参数的投票
    const pollId = new anchor.BN(2);
    const description = "Best blockchain?";
    const pollStart = new anchor.BN(Date.now() / 1000 + 3600); // 1小时后开始
    const pollEnd = new anchor.BN(Date.now() / 1000 + 7200); // 2小时后结束

    const [pollPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [pollId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    const tx = await program.methods
      .initializePoll(pollId, description, pollStart, pollEnd)
      .accountsPartial({
        pollCreator: provider.wallet.publicKey,
        poll: pollPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const pollAccount = await program.account.poll.fetch(pollPda);
    
    expect(pollAccount.pollId.toString()).to.equal(pollId.toString());
    expect(pollAccount.description).to.equal(description);
    expect(pollAccount.candidateAmount.toString()).to.equal("0");

    console.log("第二个投票创建成功! ID:", pollAccount.pollId.toString());
  });
});
