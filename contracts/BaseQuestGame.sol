// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract BaseQuestGame {
    uint256 public constant ENTRY_FEE      = 0.0001 ether;
    uint256 public constant ROUND_DURATION = 300;
    uint256 public constant OWNER_CUT_BPS  = 2000;
    uint256 public constant BPS_DENOM      = 10000;

    address public contractOwner;

    struct Round {
        uint256 roundNumber;
        uint256 startTime;
        uint256 prizePool;
        address[] players;
        mapping(address => bool) hasJoined;
        bool ended;
        address winner;
        uint256 prize;
    }

    uint256 public currentRoundNumber;
    Round private currentRound;

    struct RoundResult {
        uint256 roundNumber;
        address winner;
        uint256 prize;
        uint256 playerCount;
        uint256 endedAt;
    }

    RoundResult[] public roundHistory;
    mapping(address => uint256) public winCount;

    event PlayerJoined(address indexed player, uint256 roundNumber, uint256 prizePool);
    event RoundEnded(address indexed winner, uint256 prize, uint256 roundNumber, uint256 playerCount);
    event RoundRefunded(uint256 roundNumber, uint256 playerCount);
    event NewRoundStarted(uint256 roundNumber, uint256 startTime);

    modifier onlyOwner() { require(msg.sender == contractOwner, "BaseQuestGame: not owner"); _; }

    constructor() { contractOwner = msg.sender; _startNewRound(); }

    function _startNewRound() internal {
        currentRoundNumber += 1;
        delete currentRound.players;
        currentRound.roundNumber = currentRoundNumber;
        currentRound.startTime   = block.timestamp;
        currentRound.prizePool   = 0;
        currentRound.ended       = false;
        currentRound.winner      = address(0);
        currentRound.prize       = 0;
        emit NewRoundStarted(currentRoundNumber, block.timestamp);
    }

    function _pickWinner(uint256 playerCount) internal view returns (uint256) {
        bytes memory packed;
        for (uint256 i = 0; i < playerCount; i++) {
            packed = abi.encodePacked(packed, currentRound.players[i]);
        }
        uint256 seed = uint256(keccak256(abi.encodePacked(block.prevrandao, block.timestamp, packed, currentRoundNumber)));
        return seed % playerCount;
    }

    function joinGame() external payable {
        require(msg.value == ENTRY_FEE, "BaseQuestGame: incorrect entry fee");
        require(!currentRound.ended, "BaseQuestGame: round has ended");
        require(block.timestamp < currentRound.startTime + ROUND_DURATION, "BaseQuestGame: round time expired");
        require(!currentRound.hasJoined[msg.sender], "BaseQuestGame: already joined this round");
        currentRound.players.push(msg.sender);
        currentRound.hasJoined[msg.sender] = true;
        currentRound.prizePool += msg.value;
        emit PlayerJoined(msg.sender, currentRoundNumber, currentRound.prizePool);
    }

    function endRound() external {
        require(!currentRound.ended, "BaseQuestGame: round already ended");
        require(block.timestamp >= currentRound.startTime + ROUND_DURATION, "BaseQuestGame: round not over yet");
        uint256 playerCount = currentRound.players.length;
        if (playerCount <= 1) {
            if (playerCount == 1) {
                address sole = currentRound.players[0];
                (bool refunded, ) = payable(sole).call{value: ENTRY_FEE}("");
                require(refunded, "BaseQuestGame: refund failed");
            }
            currentRound.ended = true;
            emit RoundRefunded(currentRoundNumber, playerCount);
            _startNewRound();
            return;
        }
        uint256 winnerIndex = _pickWinner(playerCount);
        address winner      = currentRound.players[winnerIndex];
        uint256 pool        = currentRound.prizePool;
        uint256 ownerCut    = (pool * OWNER_CUT_BPS) / BPS_DENOM;
        uint256 prize       = pool - ownerCut;
        currentRound.ended  = true;
        currentRound.winner = winner;
        currentRound.prize  = prize;
        winCount[winner]   += 1;
        roundHistory.push(RoundResult({ roundNumber: currentRoundNumber, winner: winner, prize: prize, playerCount: playerCount, endedAt: block.timestamp }));
        (bool ownerPaid, ) = payable(contractOwner).call{value: ownerCut}("");
        require(ownerPaid, "BaseQuestGame: owner payment failed");
        (bool winnerPaid, ) = payable(winner).call{value: prize}("");
        require(winnerPaid, "BaseQuestGame: winner payment failed");
        emit RoundEnded(winner, prize, currentRoundNumber, playerCount);
        _startNewRound();
    }

    function getCurrentPlayers() external view returns (address[] memory) { return currentRound.players; }
    function getRoundTimeRemaining() external view returns (uint256) {
        uint256 elapsed = block.timestamp - currentRound.startTime;
        if (elapsed >= ROUND_DURATION) return 0;
        return ROUND_DURATION - elapsed;
    }
    function getRoundNumber() external view returns (uint256) { return currentRoundNumber; }
    function hasJoinedCurrentRound(address player) external view returns (bool) { return currentRound.hasJoined[player]; }
    function getCurrentPrizePool() external view returns (uint256) { return currentRound.prizePool; }
    function getCurrentRoundStartTime() external view returns (uint256) { return currentRound.startTime; }
    function isRoundEnded() external view returns (bool) { return currentRound.ended; }
    function getWinCount(address player) external view returns (uint256) { return winCount[player]; }

    function getRecentRounds(uint256 count) external view returns (RoundResult[] memory results) {
        uint256 total = roundHistory.length;
        if (count > total) count = total;
        if (count == 0) return new RoundResult[](0);
        results = new RoundResult[](count);
        for (uint256 i = 0; i < count; i++) { results[i] = roundHistory[total - count + i]; }
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "BaseQuestGame: zero address");
        contractOwner = newOwner;
    }

    receive() external payable { revert("BaseQuestGame: direct ETH not accepted"); }
}
