// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {XPRegistry} from "../src/XPRegistry.sol";

contract XPRegistryTest is Test {
    XPRegistry public registry;
    address public owner;
    address public user1;
    address public nonAwarder;

    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        nonAwarder = makeAddr("nonAwarder");
        registry = new XPRegistry();
    }

    /// @notice registerUser should mark caller as registered.
    function test_RegisterUser() public {
        vm.prank(user1);
        registry.registerUser();
        assertTrue(registry.isRegistered(user1));
    }

    /// @notice awardXP should increase totalXP by the awarded amount.
    function test_AwardXP() public {
        vm.prank(user1);
        registry.registerUser();

        registry.awardXP(user1, 100, "task_swap_1");
        assertEq(registry.totalXP(user1), 100);
    }

    /// @notice Awarding the same taskId twice to the same user should revert.
    function test_TaskIdDeduplication() public {
        vm.prank(user1);
        registry.registerUser();

        registry.awardXP(user1, 50, "task_follow_1");

        vm.expectRevert(XPRegistry.TaskAlreadyCompleted.selector);
        registry.awardXP(user1, 50, "task_follow_1");
    }

    /// @notice getLevel should return correct levels at each threshold boundary.
    function test_GetLevel() public {
        vm.prank(user1);
        registry.registerUser();

        // 0 XP = Lv1
        assertEq(registry.getLevel(user1), 1);

        // 50 XP = Lv2
        registry.awardXP(user1, 50, "t1");
        assertEq(registry.getLevel(user1), 2);

        // 200 XP = Lv3
        registry.awardXP(user1, 150, "t2");
        assertEq(registry.getLevel(user1), 3);

        // 500 XP = Lv4
        registry.awardXP(user1, 300, "t3");
        assertEq(registry.getLevel(user1), 4);

        // 1000 XP = Lv5
        registry.awardXP(user1, 500, "t4");
        assertEq(registry.getLevel(user1), 5);
    }

    /// @notice A non-awarder address should not be able to award XP.
    function test_OnlyAwarderCanAward() public {
        vm.prank(user1);
        registry.registerUser();

        vm.prank(nonAwarder);
        vm.expectRevert(XPRegistry.NotAwarder.selector);
        registry.awardXP(user1, 100, "task_x");
    }
}
