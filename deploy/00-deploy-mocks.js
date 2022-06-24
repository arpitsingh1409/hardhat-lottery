const { developmentChains } = require("../helper-hardhat-config");

const BASE_FEE = ethers.utils.parseEther("0.25"); // LINK (gas of Chainlink) cost per request
const GAS_PRICE_LINK = 1e9;

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const args = [BASE_FEE, GAS_PRICE_LINK];
  const chainId = network.config.chainId;

  if (developmentChains.includes(network.name)) {
    log("Local network detected, deploying mocks!");
    await deploy("VRFCoordinatorV2Mock", {
      from: deployer,
      log: true,
      args: args,
    });
    log("Mocks Deployed!");
    log("----------------------------------------------------------");
  }
};

module.exports.tags = ["all", "mocks"];
