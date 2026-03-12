// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IBaseQuestCore {
    function isRegistered(address user) external view returns (bool);
}

contract BaseQuestBossRaid {
    address public contractOwner;
    IBaseQuestCore public coreContract;

    uint256 public constant ATTACK_FEE    = 0.00005 ether;
    uint256 public constant OWNER_CUT_PCT = 20;
    uint256 public constant WINNER_PCT    = 80;
    uint256 public constant BASE_BOSS_HP  = 1000;
    uint256 public constant HP_SCALE      = 200;
    uint256 public constant MIN_DAMAGE    = 10;
    uint256 public constant MAX_DAMAGE    = 100;

    struct Boss {
        uint256 raidNumber;
        uint256 maxHP;
        uint256 currentHP;
        bool    defeated;
        address winner;
        uint256 prizePool;
        uint256 startedAt;
        uint256 endedAt;
        uint256 attackCount;
    }

    struct Attack {
        address attacker;
        uint256 damage;
        uint256 hpBefore;
        uint256 hpAfter;
        uint256 timestamp;
        bool    killingBlow;
    }

    Boss public currentBoss;
    uint256 public totalRaids;

    mapping(uint256 => Attack[]) public raidAttacks;
    mapping(uint256 => mapping(address => uint256)) public playerDamage;
    mapping(uint256 => address[]) public raidPlayers;
    mapping(uint256 => mapping(address => bool)) public hasAttacked;
    mapping(address => uint256) public totalDamageDealt;
    mapping(address => uint256) public totalRaidsJoined;
    mapping(address => uint256) public totalRaidsWon;

    event BossSpawned(uint256 indexed raidNumber, uint256 maxHP, uint256 timestamp);
    event AttackLanded(address indexed attacker, uint256 damage, uint256 hpRemaining, bool killingBlow, uint256 raidNumber);
    event BossDefeated(address indexed winner, uint256 prize, uint256 raidNumber, uint256 totalAttackers);
    event PrizeClaimed(address indexed winner, uint256 amount);

    modifier onlyOwner() { require(msg.sender == contractOwner, "BossRaid: not owner"); _; }

    constructor(address _coreContract) {
        contractOwner = msg.sender;
        coreContract  = IBaseQuestCore(_coreContract);
        _spawnBoss();
    }

    function _spawnBoss() internal {
        totalRaids++;
        uint256 bossHP = BASE_BOSS_HP + (HP_SCALE * (totalRaids - 1));
        currentBoss = Boss({
            raidNumber:  totalRaids,
            maxHP:       bossHP,
            currentHP:   bossHP,
            defeated:    false,
            winner:      address(0),
            prizePool:   0,
            startedAt:   block.timestamp,
            endedAt:     0,
            attackCount: 0
        });
        emit BossSpawned(totalRaids, bossHP, block.timestamp);
    }

    function _randomDamage(address attacker) internal view returns (uint256) {
        uint256 rand = uint256(keccak256(abi.encodePacked(
            block.prevrandao,
            block.timestamp,
            attacker,
            currentBoss.attackCount,
            currentBoss.currentHP
        )));
        return MIN_DAMAGE + (rand % (MAX_DAMAGE - MIN_DAMAGE + 1));
    }

    function attack() external payable {
        require(msg.value == ATTACK_FEE, "BossRaid: incorrect fee");
        require(!currentBoss.defeated, "BossRaid: boss already defeated");
        require(currentBoss.currentHP > 0, "BossRaid: boss has no HP");

        uint256 raidNum = currentBoss.raidNumber;

        // Track player
        if (!hasAttacked[raidNum][msg.sender]) {
            hasAttacked[raidNum][msg.sender] = true;
            raidPlayers[raidNum].push(msg.sender);
        }

        // Owner cut
        uint256 ownerCut = msg.value * OWNER_CUT_PCT / 100;
        uint256 poolCut  = msg.value - ownerCut;
        currentBoss.prizePool += poolCut;
        (bool sent, ) = payable(contractOwner).call{value: ownerCut}("");
        require(sent, "BossRaid: owner transfer failed");

        // Calculate damage
        uint256 damage    = _randomDamage(msg.sender);
        uint256 hpBefore  = currentBoss.currentHP;
        bool killingBlow  = false;

        if (damage >= currentBoss.currentHP) {
            damage               = currentBoss.currentHP;
            currentBoss.currentHP = 0;
            killingBlow          = true;
        } else {
            currentBoss.currentHP -= damage;
        }

        currentBoss.attackCount++;
        playerDamage[raidNum][msg.sender] += damage;
        totalDamageDealt[msg.sender]      += damage;
        totalRaidsJoined[msg.sender]++;

        // Record attack
        raidAttacks[raidNum].push(Attack({
            attacker:    msg.sender,
            damage:      damage,
            hpBefore:    hpBefore,
            hpAfter:     currentBoss.currentHP,
            timestamp:   block.timestamp,
            killingBlow: killingBlow
        }));

        emit AttackLanded(msg.sender, damage, currentBoss.currentHP, killingBlow, raidNum);

        // Boss defeated
        if (killingBlow) {
            currentBoss.defeated = true;
            currentBoss.winner   = msg.sender;
            currentBoss.endedAt  = block.timestamp;
            totalRaidsWon[msg.sender]++;

            uint256 prize = currentBoss.prizePool * WINNER_PCT / 100;
            uint256 remaining = currentBoss.prizePool - prize;

            // Send prize to winner
            (bool prizeSent, ) = payable(msg.sender).call{value: prize}("");
            require(prizeSent, "BossRaid: prize transfer failed");

            // Remaining stays in contract as next raid seed
            emit BossDefeated(msg.sender, prize, raidNum, raidPlayers[raidNum].length);
            emit PrizeClaimed(msg.sender, prize);

            // Spawn next boss
            _spawnBoss();
            currentBoss.prizePool = remaining;
        }
    }

    // ── View functions ─────────────────────────────────────────────────────

    function getBossStatus() external view returns (
        uint256 raidNumber,
        uint256 maxHP,
        uint256 currentHP,
        uint256 hpPercent,
        bool    defeated,
        address winner,
        uint256 prizePool,
        uint256 startedAt,
        uint256 attackCount,
        uint256 playerCount
    ) {
        Boss storage b = currentBoss;
        uint256 pct    = b.maxHP > 0 ? (b.currentHP * 100) / b.maxHP : 0;
        return (
            b.raidNumber, b.maxHP, b.currentHP, pct,
            b.defeated, b.winner, b.prizePool,
            b.startedAt, b.attackCount,
            raidPlayers[b.raidNumber].length
        );
    }

    function getRecentAttacks(uint256 count) external view returns (
        address[] memory attackers,
        uint256[] memory damages,
        uint256[] memory hpAfters,
        bool[]    memory killingBlows,
        uint256[] memory timestamps
    ) {
        uint256 raidNum  = currentBoss.raidNumber;
        Attack[] storage attacks = raidAttacks[raidNum];
        uint256 total    = attacks.length;
        if (count > total) count = total;

        attackers    = new address[](count);
        damages      = new uint256[](count);
        hpAfters     = new uint256[](count);
        killingBlows = new bool[](count);
        timestamps   = new uint256[](count);

        for (uint256 i = 0; i < count; i++) {
            uint256 idx      = total - count + i;
            attackers[i]    = attacks[idx].attacker;
            damages[i]      = attacks[idx].damage;
            hpAfters[i]     = attacks[idx].hpAfter;
            killingBlows[i] = attacks[idx].killingBlow;
            timestamps[i]   = attacks[idx].timestamp;
        }
    }

    function getPlayerStats(address player) external view returns (
        uint256 damageThisRaid,
        uint256 totalDamage,
        uint256 raidsJoined,
        uint256 raidsWon,
        bool    hasAttackedThisRaid
    ) {
        return (
            playerDamage[currentBoss.raidNumber][player],
            totalDamageDealt[player],
            totalRaidsJoined[player],
            totalRaidsWon[player],
            hasAttacked[currentBoss.raidNumber][player]
        );
    }

    function getRaidPlayers(uint256 raidNum) external view returns (address[] memory) {
        return raidPlayers[raidNum];
    }

    function getRaidAttackCount(uint256 raidNum) external view returns (uint256) {
        return raidAttacks[raidNum].length;
    }

    function getTotalRaids() external view returns (uint256) { return totalRaids; }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "BossRaid: zero address");
        contractOwner = newOwner;
    }

    function setCoreContract(address _core) external onlyOwner {
        coreContract = IBaseQuestCore(_core);
    }

    receive() external payable { revert("BossRaid: direct ETH not accepted"); }
}
