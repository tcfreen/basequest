// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract BaseQuestBridge {
    address public contractOwner;

    struct BridgeRecord {
        address user;
        uint256 timestamp;
        string  bridgeProtocol;
        string  note;
    }

    BridgeRecord[] public records;
    mapping(address => uint256[]) public userRecordIndexes;
    mapping(address => uint256)   public userBridgeCount;

    event BridgeRecorded(address indexed user, string bridgeProtocol, uint256 timestamp, uint256 userBridgeCount);

    modifier onlyOwner() {
        require(msg.sender == contractOwner, "BaseQuestBridge: not owner");
        _;
    }

    constructor() { contractOwner = msg.sender; }

    function recordBridge(string calldata bridgeProtocol, string calldata note) external {
        require(bytes(bridgeProtocol).length > 0,   "BaseQuestBridge: empty protocol");
        require(bytes(bridgeProtocol).length <= 64, "BaseQuestBridge: protocol name too long");
        require(bytes(note).length <= 128,          "BaseQuestBridge: note too long");
        uint256 idx = records.length;
        records.push(BridgeRecord({ user: msg.sender, timestamp: block.timestamp, bridgeProtocol: bridgeProtocol, note: note }));
        userRecordIndexes[msg.sender].push(idx);
        userBridgeCount[msg.sender] += 1;
        emit BridgeRecorded(msg.sender, bridgeProtocol, block.timestamp, userBridgeCount[msg.sender]);
    }

    function getUserRecordIndexes(address user) external view returns (uint256[] memory) { return userRecordIndexes[user]; }
    function getTotalRecords() external view returns (uint256) { return records.length; }
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "BaseQuestBridge: zero address");
        contractOwner = newOwner;
    }
}
