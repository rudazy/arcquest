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

        // Register user1 and give XP via the registry (owner is awarder)
        vm.prank(user1);
        registry.registerUser();
    }

    /// @notice User with 100+ XP should be able to claim Bronze NFT.
    function test_ClaimBronze() public {
        registry.awardXP(user1, 100, "task_bronze");

        vm.prank(user1);
        nft.claim(nft.BRONZE());

        assertEq(nft.balanceOf(user1, nft.BRONZE()), 1);
    }

    /// @notice User with insufficient XP should not be able to claim Bronze.
    function test_CannotClaimWithoutThreshold() public {
        registry.awardXP(user1, 50, "task_partial");

        vm.prank(user1);
        vm.expectRevert(abi.encodeWithSelector(ArcQuestNFT.InsufficientXP.selector, 100, 50));
        nft.claim(nft.BRONZE());
    }

    /// @notice Bronze is soulbound — transfers between non-zero addresses should revert.
    function test_BronzeSoulbound() public {
        registry.awardXP(user1, 100, "task_bronze_sb");

        vm.prank(user1);
        nft.claim(nft.BRONZE());

        vm.prank(user1);
        vm.expectRevert(ArcQuestNFT.SoulboundToken.selector);
        nft.safeTransferFrom(user1, user2, nft.BRONZE(), 1, "");
    }

    /// @notice Gold is transferable — transfers between addresses should succeed.
    function test_GoldTransferable() public {
        registry.awardXP(user1, 1000, "task_gold");

        vm.prank(user1);
        nft.claim(nft.GOLD());

        vm.prank(user1);
        nft.safeTransferFrom(user1, user2, nft.GOLD(), 1, "");

        assertEq(nft.balanceOf(user1, nft.GOLD()), 0);
        assertEq(nft.balanceOf(user2, nft.GOLD()), 1);
    }
}
