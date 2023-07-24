const SuupToken= artifacts.require("SuupToken");

module.exports = function(deployer) {
  const cap = 100000000; // Set the desired value for 'cap'
  const reward = 50; // Set the desired value for 'reward'
  deployer.deploy(SuupToken, cap, reward);
};
