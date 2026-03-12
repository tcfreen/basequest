// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract BaseQuestCore {
    address public contractOwner;
    uint256 public rewardPool;
    uint256[6] public levelThresholds = [0, 500, 1500, 3500, 7500, 15000];

    struct UserProfile {
        uint256 totalXP;
        string  username;
        bool    usernameSet;
        uint256 tasksCompleted;
        uint256 joinedAt;
        uint256 lastActivityDay;
        uint256 streakCount;
        uint256 referralCount;
        address referredBy;
    }

    struct DailyTask {
        bool gmDone; bool deployDone; bool swapDone;
        bool bridgeDone; bool gameDone; bool referralDone;
        bool mintDone;
        uint256 day;
    }

    mapping(address => UserProfile) public profiles;
    mapping(address => DailyTask)   public dailyTasks;
    mapping(address => bool)        public hasBeenReferred;
    mapping(address => bool)        public profileTaskDone;
    mapping(address => address[])   public referrals;
    address[] public allUsers;
    mapping(address => bool) public isRegistered;

    event TaskCompleted(address indexed user, string taskType, uint256 xpEarned, uint256 timestamp);
    event UsernameSet(address indexed user, string username);
    event ReferralRegistered(address indexed referrer, address indexed referred, uint256 xpEarned);
    event StreakBonusAwarded(address indexed user, uint256 streak, uint256 xpEarned);
    event XPAwarded(address indexed user, uint256 amount, uint256 newTotal);

    modifier onlyOwner() { require(msg.sender == contractOwner, "BaseQuestCore: not owner"); _; }
    modifier registered() { if (!isRegistered[msg.sender]) _registerUser(msg.sender); _; }

    constructor() { contractOwner = msg.sender; }

    function _today() internal view returns (uint256) { return block.timestamp / 86400; }

    function _registerUser(address user) internal {
        isRegistered[user] = true;
        allUsers.push(user);
        profiles[user].joinedAt = block.timestamp;
    }

    function _resetDailyIfNeeded(address user) internal {
        if (dailyTasks[user].day != _today()) {
            delete dailyTasks[user];
            dailyTasks[user].day = _today();
        }
    }

    function _awardXPAndDistribute(address user, uint256 xp, string memory taskType) internal {
        uint256 ownerCut = msg.value / 5;
        rewardPool += msg.value - ownerCut;
        (bool sent, ) = payable(contractOwner).call{value: ownerCut}("");
        require(sent, "BaseQuestCore: owner transfer failed");

        uint256 today = _today();
        UserProfile storage p = profiles[user];
        if (p.lastActivityDay == 0) { p.streakCount = 1; }
        else if (today == p.lastActivityDay + 1) { p.streakCount += 1; }
        else if (today > p.lastActivityDay + 1) { p.streakCount = 1; }
        p.lastActivityDay = today;

        if (p.streakCount > 0 && p.streakCount % 7 == 0) {
            p.totalXP += 200;
            emit StreakBonusAwarded(user, p.streakCount, 200);
        }
        p.totalXP += xp;
        p.tasksCompleted += 1;
        emit XPAwarded(user, xp, p.totalXP);
        emit TaskCompleted(user, taskType, xp, block.timestamp);
    }

    function completeGMTask() external payable registered {
        require(msg.value == 0.00005 ether, "BaseQuestCore: incorrect payment for GM task");
        _resetDailyIfNeeded(msg.sender);
        require(!dailyTasks[msg.sender].gmDone, "BaseQuestCore: GM task already done today");
        dailyTasks[msg.sender].gmDone = true;
        _awardXPAndDistribute(msg.sender, 50, "GM_BASE");
    }

    function completeDeployTask(address deployedContract) external payable registered {
        require(msg.value == 0.00005 ether, "BaseQuestCore: incorrect payment for deploy task");
        require(deployedContract != address(0), "BaseQuestCore: invalid contract address");
        _resetDailyIfNeeded(msg.sender);
        require(!dailyTasks[msg.sender].deployDone, "BaseQuestCore: deploy task already done today");
        dailyTasks[msg.sender].deployDone = true;
        _awardXPAndDistribute(msg.sender, 100, "DEPLOY_CONTRACT");
    }

    function completeSwapTask() external payable registered {
        require(msg.value == 0.00005 ether, "BaseQuestCore: incorrect payment for swap task");
        _resetDailyIfNeeded(msg.sender);
        require(!dailyTasks[msg.sender].swapDone, "BaseQuestCore: swap task already done today");
        dailyTasks[msg.sender].swapDone = true;
        _awardXPAndDistribute(msg.sender, 75, "SWAP_BASE");
    }

    function completeBridgeTask() external payable registered {
        require(msg.value == 0.00005 ether, "BaseQuestCore: incorrect payment for bridge task");
        _resetDailyIfNeeded(msg.sender);
        require(!dailyTasks[msg.sender].bridgeDone, "BaseQuestCore: bridge task already done today");
        dailyTasks[msg.sender].bridgeDone = true;
        _awardXPAndDistribute(msg.sender, 100, "BRIDGE_BASE");
    }

    function completeGameTask() external payable registered {
        require(msg.value == 0.00005 ether, "BaseQuestCore: incorrect payment for game task");
        _resetDailyIfNeeded(msg.sender);
        require(!dailyTasks[msg.sender].gameDone, "BaseQuestCore: game task already done today");
        dailyTasks[msg.sender].gameDone = true;
        _awardXPAndDistribute(msg.sender, 75, "MINI_GAME");
    }

    function completeReferralTask(address referred) external payable registered {
        require(msg.value == 0.00005 ether, "BaseQuestCore: incorrect payment for referral task");
        require(referred != address(0), "BaseQuestCore: invalid referred address");
        require(referred != msg.sender, "BaseQuestCore: cannot refer yourself");
        require(!hasBeenReferred[referred], "BaseQuestCore: address already referred");
        _resetDailyIfNeeded(msg.sender);
        require(!dailyTasks[msg.sender].referralDone, "BaseQuestCore: referral task already done today");
        hasBeenReferred[referred] = true;
        profiles[referred].referredBy = msg.sender;
        referrals[msg.sender].push(referred);
        profiles[msg.sender].referralCount += 1;
        if (!isRegistered[referred]) _registerUser(referred);

        // Award 10 XP bonus to the referred user
        profiles[referred].totalXP += 10;
        emit XPAwarded(referred, 10, profiles[referred].totalXP);

        dailyTasks[msg.sender].referralDone = true;
        _awardXPAndDistribute(msg.sender, 150, "REFERRAL");
        emit ReferralRegistered(msg.sender, referred, 150);
    }

    function completeProfileTask(string calldata username) external payable registered {
        require(msg.value == 0.00005 ether, "BaseQuestCore: incorrect payment for profile task");
        require(!profileTaskDone[msg.sender], "BaseQuestCore: profile already set");
        require(bytes(username).length > 0, "BaseQuestCore: username cannot be empty");
        require(bytes(username).length <= 32, "BaseQuestCore: username too long");
        profileTaskDone[msg.sender] = true;
        profiles[msg.sender].username = username;
        profiles[msg.sender].usernameSet = true;
        _awardXPAndDistribute(msg.sender, 50, "SET_PROFILE");
        emit UsernameSet(msg.sender, username);
    }

    function completeMintNFTTask(address nftContract) external payable registered {
        require(msg.value == 0.00005 ether, "BaseQuestCore: incorrect payment for mint task");
        require(nftContract != address(0), "BaseQuestCore: invalid NFT contract address");
        _resetDailyIfNeeded(msg.sender);
        require(!dailyTasks[msg.sender].mintDone, "BaseQuestCore: mint task already done today");
        dailyTasks[msg.sender].mintDone = true;
        _awardXPAndDistribute(msg.sender, 125, "MINT_NFT");
    }

    function getUserXP(address user) external view returns (uint256) { return profiles[user].totalXP; }

    function getUserLevel(address user) external view returns (uint256) {
        uint256 xp = profiles[user].totalXP;
        for (uint256 i = 5; i > 0; i--) { if (xp >= levelThresholds[i]) return i + 1; }
        return 1;
    }

    function getUserProfile(address user) external view returns (
        uint256 totalXP, string memory username, bool usernameSet,
        uint256 tasksCompleted, uint256 joinedAt, uint256 streakCount,
        uint256 referralCount, address referredBy
    ) {
        UserProfile storage p = profiles[user];
        return (p.totalXP, p.username, p.usernameSet, p.tasksCompleted,
                p.joinedAt, p.streakCount, p.referralCount, p.referredBy);
    }

    function getDailyTasks(address user) external view returns (
        bool gmDone, bool deployDone, bool swapDone,
        bool bridgeDone, bool gameDone, bool referralDone,
        bool profileDone, bool mintDone
    ) {
        DailyTask storage d = dailyTasks[user];
        bool today = (d.day == _today());
        return (today && d.gmDone, today && d.deployDone, today && d.swapDone,
                today && d.bridgeDone, today && d.gameDone, today && d.referralDone,
                profileTaskDone[user], today && d.mintDone);
    }

    function getTopUsers(uint256 count) external view returns (address[] memory topAddresses, uint256[] memory topXPs) {
        uint256 total = allUsers.length;
        if (count > total) count = total;
        if (count == 0) return (new address[](0), new uint256[](0));
        address[] memory sortedAddrs = new address[](total);
        uint256[] memory sortedXPs   = new uint256[](total);
        for (uint256 i = 0; i < total; i++) {
            sortedAddrs[i] = allUsers[i];
            sortedXPs[i]   = profiles[allUsers[i]].totalXP;
        }
        for (uint256 i = 1; i < total; i++) {
            address keyAddr = sortedAddrs[i];
            uint256 keyXP   = sortedXPs[i];
            int256 j = int256(i) - 1;
            while (j >= 0 && sortedXPs[uint256(j)] < keyXP) {
                sortedAddrs[uint256(j) + 1] = sortedAddrs[uint256(j)];
                sortedXPs[uint256(j) + 1]   = sortedXPs[uint256(j)];
                j--;
            }
            sortedAddrs[uint256(j) + 1] = keyAddr;
            sortedXPs[uint256(j) + 1]   = keyXP;
        }
        topAddresses = new address[](count);
        topXPs       = new uint256[](count);
        for (uint256 i = 0; i < count; i++) { topAddresses[i] = sortedAddrs[i]; topXPs[i] = sortedXPs[i]; }
    }

    function getTotalUsers() external view returns (uint256) { return allUsers.length; }
    function getUserStreak(address user) external view returns (uint256) { return profiles[user].streakCount; }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "BaseQuestCore: zero address");
        contractOwner = newOwner;
    }

    receive() external payable { revert("BaseQuestCore: direct ETH not accepted"); }
}
