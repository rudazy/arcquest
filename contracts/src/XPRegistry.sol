// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title XPRegistry
/// @notice Tracks user registration, XP balances, and level thresholds for Arc Terminal.
/// @dev Deployed on Arc testnet. XP is awarded server-side via an authorized awarder role.
contract XPRegistry {
    // ─── Errors ──────────────────────────────────────────────────────────
    error NotOwner();
    error NotAwarder();
    error AlreadyRegistered();
    error TaskAlreadyCompleted();
    error ZeroAmount();

    // ─── Events ──────────────────────────────────────────────────────────
    event UserRegistered(address indexed user);
    event XPAwarded(address indexed user, uint256 amount, bytes32 indexed taskHash);
    event AwarderUpdated(address indexed awarder, bool status);

    // ─── State ───────────────────────────────────────────────────────────
    address public owner;
    mapping(address => bool) public awarders;
    mapping(address => bool) public registered;
    mapping(address => uint256) public xp;
    mapping(address => mapping(bytes32 => bool)) public completedTasks;

    /// @notice Level thresholds: Lv1=0, Lv2=50, Lv3=200, Lv4=500, Lv5=1000
    uint256[5] public levelThresholds;

    // ─── Modifiers ───────────────────────────────────────────────────────
    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier onlyAwarder() {
        if (!awarders[msg.sender]) revert NotAwarder();
        _;
    }

    // ─── Constructor ─────────────────────────────────────────────────────
    constructor() {
        owner = msg.sender;
        awarders[msg.sender] = true;
        levelThresholds = [0, 50, 200, 500, 1000];
    }

    // ─── Registration ────────────────────────────────────────────────────

    /// @notice Register the caller as a user.
    function registerUser() external {
        if (registered[msg.sender]) revert AlreadyRegistered();
        registered[msg.sender] = true;
        emit UserRegistered(msg.sender);
    }

    /// @notice Check if an address is registered.
    function isRegistered(address user) external view returns (bool) {
        return registered[user];
    }

    // ─── XP ──────────────────────────────────────────────────────────────

    /// @notice Award XP to a user for completing a task. Reverts if taskId already used.
    /// @param user     The recipient address.
    /// @param amount   XP to award (must be > 0).
    /// @param taskId   Unique identifier for the task — prevents double-claiming.
    function awardXP(address user, uint256 amount, string calldata taskId) external onlyAwarder {
        if (amount == 0) revert ZeroAmount();
        bytes32 taskHash = keccak256(bytes(taskId));
        if (completedTasks[user][taskHash]) revert TaskAlreadyCompleted();
        completedTasks[user][taskHash] = true;
        xp[user] += amount;
        emit XPAwarded(user, amount, taskHash);
    }

    /// @notice Get the total XP for a user.
    function totalXP(address user) external view returns (uint256) {
        return xp[user];
    }

    // ─── Levels ──────────────────────────────────────────────────────────

    /// @notice Get the level (1-5) for a user based on XP thresholds.
    function getLevel(address user) external view returns (uint256) {
        uint256 userXP = xp[user];
        for (uint256 i = 4; i >= 1; i--) {
            if (userXP >= levelThresholds[i]) return i + 1;
        }
        return 1;
    }

    // ─── Admin ───────────────────────────────────────────────────────────

    /// @notice Grant or revoke awarder privileges.
    function setAwarder(address awarder, bool status) external onlyOwner {
        awarders[awarder] = status;
        emit AwarderUpdated(awarder, status);
    }
}
