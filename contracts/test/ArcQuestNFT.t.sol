// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {XPRegistry} from "../src/XPRegistry.sol";
import {ArcQuestNFT} from "../src/ArcQuestNFT.sol";

contract ArcQuestNFTTest is Test {
    XPRegistry public registry;
    ArcQuestNFT public nft;
    address public owner;
    address public user1;
    address public user2;

    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");

        registry = new XPRegistry();
        nft = new ArcQuestNFT(address(registry));

        registry.setAwarder(address(this), true);

        vm.startPrank(user1);
        registry.registerUser();
        vm.stopPrank();
    }

    function test_ClaimBronze() public {
        registry.awardXP(user1, 100, "task_bronze");
        assertEq(registry.totalXP(user1), 100);

        vm.startPrank(user1);
        nft.claim(nft.BRONZE());
        vm.stopPrank();

        assertEq(nft.balanceOf(user1, nft.BRONZE()), 1);
    }

    function test_CannotClaimWithoutThreshold() public {
        registry.awardXP(user1, 50, "task_partial");

        assertEq(registry.totalXP(user1), 50, "user1 XP should be 50");

        uint256 bronze = nft.BRONZE();
        assertEq(nft.xpThreshold(bronze), 100, "bronze threshold should be 100");

        vm.startPrank(user1);
        vm.expectRevert();
        nft.claim(bronze);
        vm.stopPrank();
    }

    function test_BronzeSoulbound() public {
        registry.awardXP(user1, 100, "task_bronze_sb");

        uint256 bronze = nft.BRONZE();
        assertEq(nft.soulbound(bronze), true, "bronze should be soulbound");

        vm.startPrank(user1);
        nft.claim(bronze);

        assertEq(nft.balanceOf(user1, bronze), 1, "user1 should own bronze");

        vm.expectRevert();
        nft.safeTransferFrom(user1, user2, bronze, 1, "");
        vm.stopPrank();
    }

    function test_GoldTransferable() public {
        registry.awardXP(user1, 1000, "task_gold");

        vm.startPrank(user1);
        nft.claim(nft.GOLD());
        nft.safeTransferFrom(user1, user2, nft.GOLD(), 1, "");
        vm.stopPrank();

        assertEq(nft.balanceOf(user1, nft.GOLD()), 0);
        assertEq(nft.balanceOf(user2, nft.GOLD()), 1);
    }
}