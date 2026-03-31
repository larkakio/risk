// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {CheckIn} from "../src/CheckIn.sol";

contract CheckInTest is Test {
    CheckIn public c;
    address alice = address(0xA11CE);
    uint256 constant ONE_DAY = 1 days;

    function setUp() public {
        c = new CheckIn();
    }

    function test_checkIn_firstTime() public {
        uint256 today = block.timestamp / ONE_DAY;
        vm.prank(alice);
        vm.expectEmit(true, true, true, true);
        emit CheckIn.CheckedIn(alice, today, 1);
        c.checkIn();
        assertEq(c.streak(alice), 1);
        assertEq(c.lastCheckDayRaw(alice), today + 1);
    }

    function test_checkIn_revertWithValue() public {
        vm.deal(alice, 1 ether);
        vm.prank(alice);
        vm.expectRevert(CheckIn.ValueNotAllowed.selector);
        c.checkIn{value: 1 wei}();
    }

    function test_checkIn_sameDayTwice_reverts() public {
        vm.startPrank(alice);
        c.checkIn();
        vm.expectRevert(CheckIn.AlreadyCheckedInToday.selector);
        c.checkIn();
        vm.stopPrank();
    }

    function test_checkIn_nextDay_incrementsStreak() public {
        vm.startPrank(alice);
        uint256 day0 = block.timestamp / ONE_DAY;
        c.checkIn();
        vm.warp(block.timestamp + ONE_DAY);
        uint256 day1 = block.timestamp / ONE_DAY;
        assertEq(day1, day0 + 1);
        c.checkIn();
        assertEq(c.streak(alice), 2);
        vm.stopPrank();
    }

    function test_checkIn_skipDay_resetsStreak() public {
        vm.startPrank(alice);
        c.checkIn();
        vm.warp(block.timestamp + 3 * ONE_DAY);
        c.checkIn();
        assertEq(c.streak(alice), 1);
        vm.stopPrank();
    }
}
