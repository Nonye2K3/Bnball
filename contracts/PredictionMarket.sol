// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PredictionMarket {
    struct Market {
        uint256 id;
        string title;
        string description;
        string category;
        uint256 deadline;
        uint256 yesPool;
        uint256 noPool;
        uint256 totalPool;
        uint256 participants;
        bool resolved;
        bool outcome;
        address creator;
        uint256 creatorStake;
    }

    struct Bet {
        uint256 marketId;
        bool prediction;
        uint256 amount;
        uint256 timestamp;
        bool claimed;
    }

    uint256 public minBetAmount = 0.01 ether;
    uint256 public createMarketStake = 1.0 ether;
    uint256 public marketCount;
    address public owner;
    
    mapping(uint256 => Market) public markets;
    mapping(address => Bet[]) public userBets;
    mapping(uint256 => mapping(address => Bet)) public marketUserBets;
    mapping(uint256 => mapping(bool => uint256)) public marketPools;
    
    event MarketCreated(uint256 indexed marketId, address indexed creator, string title, uint256 deadline);
    event BetPlaced(uint256 indexed marketId, address indexed bettor, bool prediction, uint256 amount);
    event MarketResolved(uint256 indexed marketId, bool outcome);
    event WinningsClaimed(uint256 indexed marketId, address indexed winner, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    modifier marketExists(uint256 marketId) {
        require(marketId > 0 && marketId <= marketCount, "Market does not exist");
        _;
    }

    modifier marketNotResolved(uint256 marketId) {
        require(!markets[marketId].resolved, "Market already resolved");
        _;
    }

    modifier beforeDeadline(uint256 marketId) {
        require(block.timestamp < markets[marketId].deadline, "Market deadline passed");
        _;
    }

    modifier afterDeadline(uint256 marketId) {
        require(block.timestamp >= markets[marketId].deadline, "Market deadline not passed");
        _;
    }

    constructor() {
        owner = msg.sender;
        marketCount = 0;
    }

    function createMarket(
        string memory title,
        string memory description,
        string memory category,
        uint256 deadline
    ) external payable returns (uint256 marketId) {
        require(msg.value == createMarketStake, "Must send exact stake amount");
        require(deadline > block.timestamp, "Deadline must be in the future");
        require(bytes(title).length >= 10, "Title too short");
        require(bytes(description).length >= 50, "Description too short");

        marketCount++;
        marketId = marketCount;

        markets[marketId] = Market({
            id: marketId,
            title: title,
            description: description,
            category: category,
            deadline: deadline,
            yesPool: 0,
            noPool: 0,
            totalPool: 0,
            participants: 0,
            resolved: false,
            outcome: false,
            creator: msg.sender,
            creatorStake: msg.value
        });

        emit MarketCreated(marketId, msg.sender, title, deadline);
        return marketId;
    }

    function placeBet(uint256 marketId, bool prediction)
        external
        payable
        marketExists(marketId)
        marketNotResolved(marketId)
        beforeDeadline(marketId)
    {
        require(msg.value >= minBetAmount, "Bet amount too low");
        require(marketUserBets[marketId][msg.sender].amount == 0, "Already bet on this market");

        Market storage market = markets[marketId];
        
        if (prediction) {
            market.yesPool += msg.value;
            marketPools[marketId][true] += msg.value;
        } else {
            market.noPool += msg.value;
            marketPools[marketId][false] += msg.value;
        }
        
        market.totalPool += msg.value;
        market.participants++;

        Bet memory newBet = Bet({
            marketId: marketId,
            prediction: prediction,
            amount: msg.value,
            timestamp: block.timestamp,
            claimed: false
        });

        userBets[msg.sender].push(newBet);
        marketUserBets[marketId][msg.sender] = newBet;

        emit BetPlaced(marketId, msg.sender, prediction, msg.value);
    }

    function resolveMarket(uint256 marketId, bool outcome)
        external
        onlyOwner
        marketExists(marketId)
        marketNotResolved(marketId)
        afterDeadline(marketId)
    {
        Market storage market = markets[marketId];
        
        market.resolved = true;
        market.outcome = outcome;

        uint256 totalPayout = market.creatorStake;
        
        if (market.totalPool > 0) {
            uint256 creatorFee = (market.totalPool * 5) / 1000;
            totalPayout += creatorFee;
        }

        emit MarketResolved(marketId, outcome);

        (bool success, ) = payable(market.creator).call{value: totalPayout}("");
        require(success, "Failed to send funds to creator");
    }

    function claimWinnings(uint256 marketId)
        external
        marketExists(marketId)
    {
        Market storage market = markets[marketId];
        require(market.resolved, "Market not resolved yet");

        Bet storage userBet = marketUserBets[marketId][msg.sender];
        require(userBet.amount > 0, "No bet found");
        require(!userBet.claimed, "Winnings already claimed");

        uint256 winningPool = market.outcome ? market.yesPool : market.noPool;
        uint256 losingPool = market.outcome ? market.noPool : market.yesPool;
        
        uint256 creatorFee = (market.totalPool * 5) / 1000;
        uint256 availablePool = market.totalPool - creatorFee;
        uint256 winnings;

        if (winningPool == 0) {
            require(userBet.prediction != market.outcome, "No winners to claim from");
            winnings = (userBet.amount * availablePool) / losingPool;
        } else {
            require(userBet.prediction == market.outcome, "Bet lost");
            winnings = (userBet.amount * availablePool) / winningPool;
        }

        userBet.claimed = true;

        for (uint i = 0; i < userBets[msg.sender].length; i++) {
            if (userBets[msg.sender][i].marketId == marketId) {
                userBets[msg.sender][i].claimed = true;
                break;
            }
        }

        emit WinningsClaimed(marketId, msg.sender, winnings);

        (bool success, ) = payable(msg.sender).call{value: winnings}("");
        require(success, "Failed to send winnings");
    }

    function getMarketDetails(uint256 marketId)
        external
        view
        marketExists(marketId)
        returns (Market memory)
    {
        return markets[marketId];
    }

    function getUserBets(address user) external view returns (Bet[] memory) {
        return userBets[user];
    }

    function getUserBetInMarket(uint256 marketId, address user)
        external
        view
        returns (bool hasBet, bool prediction, uint256 amount, bool claimed)
    {
        Bet memory bet = marketUserBets[marketId][user];
        if (bet.amount == 0) {
            return (false, false, 0, false);
        }
        return (true, bet.prediction, bet.amount, bet.claimed);
    }

    function updateMinBetAmount(uint256 newMinBet) external onlyOwner {
        minBetAmount = newMinBet;
    }

    function updateCreateMarketStake(uint256 newStake) external onlyOwner {
        createMarketStake = newStake;
    }

    receive() external payable {}
}
