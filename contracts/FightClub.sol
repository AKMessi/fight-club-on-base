// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol"; // <--- FIXED PATH

contract FightClub is Ownable, ReentrancyGuard {
    uint256 public constant entryFee = 0.001 ether;
    mapping(address => uint256) public playerBalance;

    event PlayerJoined(address indexed player);

    // Pass msg.sender to Ownable constructor
    constructor() Ownable(msg.sender) {}

    function enterArena() external payable {
        require(msg.value == entryFee, "Incorrect entry fee");
        emit PlayerJoined(msg.sender);
    }

    function withdraw() external nonReentrant {
        uint256 amount = playerBalance[msg.sender];
        require(amount > 0, "Nothing to withdraw");

        playerBalance[msg.sender] = 0;
        (bool ok, ) = msg.sender.call{value: amount}("");
        require(ok, "Transfer failed");
    }

    function adminPayout(address winner, uint256 amount) external onlyOwner {
        require(winner != address(0), "Invalid winner");
        require(amount > 0, "Zero amount");
        require(address(this).balance >= amount, "Insufficient pot");

        playerBalance[winner] += amount;
    }
}