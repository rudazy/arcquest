// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {XPRegistry} from "./XPRegistry.sol";

/// @title ArcQuestNFT
/// @notice ERC-1155 milestone NFTs for Arc Terminal.
///         Bronze (100 XP) and Silver (500 XP) are soulbound.
///         Gold (1000 XP) is transferable.
contract ArcQuestNFT is ERC1155 {
    // ─── Constants ───────────────────────────────────────────────────────
    uint256 public constant BRONZE = 1;
    uint256 public constant SILVER = 2;
    uint256 public constant GOLD = 3;

    // ─── Errors ──────────────────────────────────────────────────────────
    error AlreadyClaimed();
    error InsufficientXP(uint256 required, uint256 actual);
    error SoulboundToken();

    // ─── Events ──────────────────────────────────────────────────────────
    event MilestoneClaimed(address indexed user, uint256 indexed tokenId, uint256 xpAtClaim);

    // ─── State ───────────────────────────────────────────────────────────
    XPRegistry public immutable xpRegistry;

    mapping(uint256 => uint256) public xpThreshold;
    mapping(uint256 => bool) public soulbound;
    mapping(address => mapping(uint256 => bool)) public claimed;

    // ─── Constructor ─────────────────────────────────────────────────────
    constructor(address _xpRegistry) ERC1155("") {
        xpRegistry = XPRegistry(_xpRegistry);

        xpThreshold[BRONZE] = 100;
        xpThreshold[SILVER] = 500;
        xpThreshold[GOLD] = 1000;

        soulbound[BRONZE] = true;
        soulbound[SILVER] = true;
        soulbound[GOLD] = false;
    }

    // ─── Claiming ────────────────────────────────────────────────────────

    /// @notice Claim a milestone NFT if the caller has enough XP.
    /// @param tokenId The milestone token (BRONZE=1, SILVER=2, GOLD=3).
    function claim(uint256 tokenId) external {
        if (claimed[msg.sender][tokenId]) revert AlreadyClaimed();
        uint256 userXP = xpRegistry.totalXP(msg.sender);
        uint256 required = xpThreshold[tokenId];
        if (userXP < required) revert InsufficientXP(required, userXP);
        claimed[msg.sender][tokenId] = true;
        _mint(msg.sender, tokenId, 1, "");
        emit MilestoneClaimed(msg.sender, tokenId, userXP);
    }

    // ─── Soulbound enforcement ───────────────────────────────────────────

    /// @dev Blocks transfers of soulbound tokens. Minting and burning are allowed.
    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal override {
        for (uint256 i = 0; i < ids.length; i++) {
            // Allow mint (from == 0) and burn (to == 0), block transfers of soulbound
            if (from != address(0) && to != address(0) && soulbound[ids[i]]) {
                revert SoulboundToken();
            }
        }
        super._update(from, to, ids, values);
    }
}
