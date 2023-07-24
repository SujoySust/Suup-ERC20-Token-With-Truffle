const {expect} = require('chai');

const SuupToken = artifacts.require("SuupToken");

contract('SuppToken Contract', (accounts) => {
  // global vars
  let suupToken;
  const owner = accounts[0];
  const addr1 = accounts[1];
  const addr2 = accounts[2];
  const tokenCap = 100000000;
  const tokenBlockReward = 50;

  beforeEach(async () => {
    suupToken = await SuupToken.new(tokenCap, tokenBlockReward);
  });

  describe("Deployment", () => {
    it('Should set the right owner', async () => {
      const contractOwner = await suupToken.owner();
      assert.equal(contractOwner, owner, "Owner is not set correctly");
    });

    it('Should assign the total supply of tokens to the owner', async () => {
      const ownerBalance = await suupToken.balanceOf(owner);
      const totalSupply = await suupToken.totalSupply();
      assert.equal(totalSupply.toString(), ownerBalance.toString(), "Total supply is not assigned correctly");
    });

    it('Should set the max capped supply to the argument provided during deployment', async () => {
      const cap = await suupToken.cap();
      assert.equal(cap.toString(), tokenCap * 1000000000000000000, "Max capped supply is not set correctly");
    });

    it('Should set the blockReward to the argument provided during deployment', async () => {
      const blockReward = await suupToken.blockReward();
      assert.equal(blockReward.toString(), tokenBlockReward * 1000000000000000000, "Block reward is not set correctly");
    });
  });

  describe("Transactions", () => {
    it('Should transfer token between accounts', async () => {
      // Transfer 50 tokens from owner to addr1
      await suupToken.transfer(addr1, 50);
      const addr1Blance = await suupToken.balanceOf(addr1);
      assert.equal(addr1Blance.toNumber(), 50, "Transfer failed from owner to addr1");

      // Transfer 50 tokens from addr1 to addr2
      await suupToken.transfer(addr2, 50, { from: addr1 });
      const addr2Balance = await suupToken.balanceOf(addr2);
      assert.equal(addr2Balance.toNumber(), 50, "Transfer failed from addr1 to addr2");
    });

    it("Should fail if sender doesn't have enough tokens", async () => {
      const initalOwnerBalance = await suupToken.balanceOf(owner);

      // Try to send 1 token from addr1 (0 token) to owner (10000000 tokens),
      // require will evaluate false and revert the transaction

      try {
        await suupToken.transfer(owner, 1, { from: addr1 });
        assert.fail("Transfer succeeded when it should have failed");
      } catch (error) {
        assert.include(error.message, "ERC20: transfer amount exceeds balance", "Transfer failure message is incorrect");
      }

      // Owner balance should not have changed
      const ownerBalance = await suupToken.balanceOf(owner);
      assert.equal(ownerBalance.toString(), initalOwnerBalance.toString(), "Owner balance changed unexpectedly");
    });

    it('Should update balance after transfer', async () => {
        const initialOwnerBalance = await suupToken.balanceOf(owner);

        // Transfer 100 tokens from owner to addr1
        await suupToken.transfer(addr1, 100);
        const addr1Balance = await suupToken.balanceOf(addr1);
        assert.equal(addr1Balance.toString(), "100", "Transfer failed from owner to addr1");

        // Transfer another 50 tokens from owner to addr2
        await suupToken.transfer(addr2, 50);
        const addr2Balance = await suupToken.balanceOf(addr2);
        assert.equal(addr2Balance.toString(), "50", "Transfer failed from owner to addr2");

        // Convert 150 to a BigNumber object
        const amountToSubtract = web3.utils.toBN(150);

        // Check balances
        const finalOwnerBalance = await suupToken.balanceOf(owner);
        assert.equal(finalOwnerBalance.toString(), initialOwnerBalance.sub(amountToSubtract).toString(), "Owner balance not updated correctly");
    });
  });
});
