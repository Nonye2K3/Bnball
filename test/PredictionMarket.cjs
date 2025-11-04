const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PredictionMarket", function () {
  async function deployFixture() {
    const [owner, platform, user, otherUser] = await ethers.getSigners();

    const MockAggregator = await ethers.getContractFactory("MockAggregator");
    const initialPrice = BigInt(400 * 10 ** 8);
    const mockAggregator = await MockAggregator.deploy(initialPrice);
    await mockAggregator.waitForDeployment();

    const PredictionMarket = await ethers.getContractFactory("PredictionMarket");
    const predictionMarket = await PredictionMarket.deploy(platform.address, await mockAggregator.getAddress());
    await predictionMarket.waitForDeployment();

    return { predictionMarket, mockAggregator, owner, platform, user, otherUser };
  }

  it("collects the exact fee and refunds the buffer when registering", async function () {
    const { predictionMarket, user, platform } = await deployFixture();

    const requiredFee = await predictionMarket.getRegistrationFeeInBNB();
    const buffer = requiredFee / 100n;
    const platformBalanceBefore = await ethers.provider.getBalance(platform.address);

    const tx = await predictionMarket.connect(user).registerUser({ value: requiredFee + buffer });
    await expect(tx).to.emit(predictionMarket, "UserRegistered").withArgs(user.address, requiredFee);

    const platformBalanceAfter = await ethers.provider.getBalance(platform.address);
    expect(platformBalanceAfter - platformBalanceBefore).to.equal(requiredFee);

    const contractBalance = await ethers.provider.getBalance(await predictionMarket.getAddress());
    expect(contractBalance).to.equal(0n);

    const isRegistered = await predictionMarket.registeredUsers(user.address);
    expect(isRegistered).to.equal(true);
  });

  it("auto-collects the registration fee during market creation for unregistered users", async function () {
    const { predictionMarket, platform, otherUser } = await deployFixture();

    const stakeAmount = await predictionMarket.createMarketStake();
    const requiredFee = await predictionMarket.getRegistrationFeeInBNB();
    const totalValue = stakeAmount + requiredFee + 1000n;

    const platformBalanceBefore = await ethers.provider.getBalance(platform.address);
    const latestBlock = await ethers.provider.getBlock("latest");
    const deadline = BigInt((latestBlock.timestamp ?? Math.floor(Date.now() / 1000)) + 3600);

    const tx = predictionMarket
      .connect(otherUser)
      .createMarket(
        "Will ETH price increase?",
        "Detailed description explaining conditions for the market outcome.",
        "crypto",
        deadline,
        {
          value: totalValue,
        }
      );

    await expect(tx).to.emit(predictionMarket, "UserRegistered").withArgs(otherUser.address, requiredFee);
    await expect(tx).to.emit(predictionMarket, "MarketCreated");

    const platformBalanceAfter = await ethers.provider.getBalance(platform.address);
    expect(platformBalanceAfter - platformBalanceBefore).to.equal(requiredFee);

    const contractBalance = await ethers.provider.getBalance(await predictionMarket.getAddress());
    expect(contractBalance).to.equal(stakeAmount);

    const market = await predictionMarket.getMarketDetails(1);
    expect(market.creator).to.equal(otherUser.address);
    expect(market.creatorStake).to.equal(stakeAmount);
    expect(market.totalPool).to.equal(0n);

    const isRegistered = await predictionMarket.registeredUsers(otherUser.address);
    expect(isRegistered).to.equal(true);
  });

  it("allows registered users to create markets without paying the fee again", async function () {
    const { predictionMarket, user, platform } = await deployFixture();

    const requiredFee = await predictionMarket.getRegistrationFeeInBNB();
    await predictionMarket.connect(user).registerUser({ value: requiredFee });

    const stakeAmount = await predictionMarket.createMarketStake();
    const latestBlock = await ethers.provider.getBlock("latest");
    const deadline = BigInt((latestBlock.timestamp ?? Math.floor(Date.now() / 1000)) + 7200);

    const platformBalanceBefore = await ethers.provider.getBalance(platform.address);

    await expect(
      predictionMarket
        .connect(user)
        .createMarket(
          "Will BTC price drop?",
          "Another detailed description satisfying minimum length for the market.",
          "crypto",
          deadline,
          {
            value: stakeAmount,
          }
        )
    ).to.emit(predictionMarket, "MarketCreated");

    const platformBalanceAfter = await ethers.provider.getBalance(platform.address);
    expect(platformBalanceAfter - platformBalanceBefore).to.equal(0n);

    const contractBalance = await ethers.provider.getBalance(await predictionMarket.getAddress());
    expect(contractBalance).to.equal(stakeAmount);
  });

  it("reverts when insufficient value is sent for unregistered market creation", async function () {
    const { predictionMarket, otherUser } = await deployFixture();

    const stakeAmount = await predictionMarket.createMarketStake();
    const latestBlock = await ethers.provider.getBlock("latest");
    const deadline = BigInt((latestBlock.timestamp ?? Math.floor(Date.now() / 1000)) + 3600);

    await expect(
      predictionMarket
        .connect(otherUser)
        .createMarket(
          "Will SOL price pump?",
          "Detailed description meeting the required minimum length for validation.",
          "crypto",
          deadline,
          {
            value: stakeAmount,
          }
        )
    ).to.be.revertedWith("Insufficient stake and fee");
  });
});
