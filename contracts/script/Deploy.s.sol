// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "forge-std/console2.sol";
import "../src/XPRegistry.sol";
import "../src/ArcQuestNFT.sol";

contract Deploy is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerKey);

        XPRegistry xpRegistry = new XPRegistry();
        ArcQuestNFT arcQuestNFT = new ArcQuestNFT(address(xpRegistry));

        vm.stopBroadcast();

        console2.log("XPRegistry deployed to:", address(xpRegistry));
        console2.log("ArcQuestNFT deployed to:", address(arcQuestNFT));
    }
}