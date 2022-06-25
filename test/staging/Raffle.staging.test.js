const { assert, expect } = require("chai");
const { getNamedAccounts, deployments, ethers, network } = require("hardhat");
const {
  isCallTrace,
} = require("hardhat/internal/hardhat-network/stack-traces/message-trace");
const {
  developmentChains,
  networkConfig,
} = require("../../helper-hardhat-config");

developmentChains.includes(network.name)
  ? describe.skip
  : describe("Raffle Unit Tests", function () {
      let raffle, raffleEntranceFee, deployer;

      beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer;
        raffle = await ethers.getContract("Raffle", deployer); //Contract connected to our deployer account
        raffleEntranceFee = await raffle.getEntranceFee();
      });

      describe("fulfillRandomWords", function () {
        it("works with live Chainlink keepers and Chainlink VRF, we get a random winner", async function () {
          const startingTimeStamp = await raffle.getLatestTimeStamp();
          const accounts = await ethers.getSigners();

          await new Promise(async (resolve, reject) => {
            raffle.once("WinnerPicked", async () => {
              console.log("WinnerPicked event has been fired!");

              try {
                const recentWinner = await raffle.getRecentWinner();
                const raffleState = await raffle.getRaffleState();
                const winnerEndingBalance = await accounts[0].getBalance(); //deployer balance
                const endingTimeStamp = await raffle.getLatestTimeStamp();

                await expect(raffle.getPlayers(0)).to.be.reverted;
                assert.equal(recentWinner.toString(), accounts[0].address);
                assert.equal(raffleState.toString(), "0");
                assert.equal(
                  winnerEndingBalance.toString(),
                  winnerStartingBalance.add(raffleEntranceFee).toString()
                );
                assert(endingTimeStamp > startingTimeStamp);
                resolve();
              } catch (e) {
                console.error(e);
                reject(e);
              }
            });
            await raffle.enterRaffle({ value: raffleEntranceFee });
            const winnerStartingBalance = await accounts[0].getBalance();
          });
        });
      });
    });
