// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Daily check-in on Base. One successful check per UTC calendar day. No ETH accepted.
/// @dev Stores last day as (dayIndex + 1) so day 0 is representable and 0 means "never checked".
contract CheckIn {
    /// @notice Raw day + 1; 0 means the user has never checked in.
    mapping(address => uint256) public lastCheckDayRaw;
    mapping(address => uint256) public streak;

    event CheckedIn(address indexed user, uint256 indexed dayIndex, uint256 newStreak);

    error ValueNotAllowed();
    error AlreadyCheckedInToday();

    function checkIn() external payable {
        if (msg.value != 0) revert ValueNotAllowed();

        uint256 today = block.timestamp / 1 days;
        uint256 raw = lastCheckDayRaw[msg.sender];

        if (raw != 0 && raw - 1 == today) revert AlreadyCheckedInToday();

        uint256 lastDay = raw == 0 ? type(uint256).max : raw - 1;

        uint256 newStreak;
        if (raw == 0) {
            newStreak = 1;
        } else if (lastDay + 1 == today) {
            newStreak = streak[msg.sender] + 1;
        } else {
            newStreak = 1;
        }

        lastCheckDayRaw[msg.sender] = today + 1;
        streak[msg.sender] = newStreak;
        emit CheckedIn(msg.sender, today, newStreak);
    }
}
