// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface AggregatorV3Interface {
    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        );
}

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
        uint256 creatorFeeAccrued;
    }

    struct Bet {
        uint256 marketId;
        bool prediction;
        uint256 amount;
        uint256 timestamp;
        bool claimed;
    }

    // Constants
    uint256 public constant PLATFORM_FEE_BP = 1000; // 10% in basis points
    uint256 public constant CREATOR_FEE_BP = 200;   // 2% in basis points
    uint256 public constant BASIS_POINTS = 10000;
    
    uint256 public minBetAmount = 0.01 ether;
    uint256 public createMarketStake = 0.1 ether;
    uint256 public registrationFeeUSD = 2; // $2 USD
    uint256 public marketCount;
    
    address public owner;
    address public immutable platformFeeRecipient;
    AggregatorV3Interface public immutable bnbUsdPriceFeed;
    
    mapping(uint256 => Market) public markets;
    mapping(address => Bet[]) public userBets;
    mapping(uint256 => mapping(address => Bet)) public marketUserBets;
    mapping(uint256 => mapping(bool => uint256)) public marketPools;
    mapping(address => bool) public registeredUsers;
    
    event MarketCreated(uint256 indexed marketId, address indexed creator, string title, uint256 deadline);
    event BetPlaced(uint256 indexed marketId, address indexed bettor, bool prediction, uint256 amount, uint256 platformFee, uint256 creatorFee);
    event MarketResolved(uint256 indexed marketId, bool outcome);
    event WinningsClaimed(uint256 indexed marketId, address indexed winner, uint256 amount);
    event UserRegistered(address indexed user, uint256 feePaid);
    event PlatformFeeCollected(uint256 amount);

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

    modifier requiresRegistration() {
        require(registeredUsers[msg.sender], "User must register first");
        _;
    }

    constructor(address _platformFeeRecipient, address _bnbUsdPriceFeed) {
        require(_platformFeeRecipient != address(0), "Invalid platform fee recipient");
        require(_bnbUsdPriceFeed != address(0), "Invalid price feed address");
        
        owner = msg.sender;
        platformFeeRecipient = _platformFeeRecipient;
        bnbUsdPriceFeed = AggregatorV3Interface(_bnbUsdPriceFeed);
        marketCount = 0;
        
        // Owner is pre-registered
        registeredUsers[msg.sender] = true;
    }

    /**
     * @notice Register user with $2 USD equivalent in BNB
     * @dev Uses Chainlink BNB/USD oracle to convert USD to BNB
     */
    function registerUser() external payable {
        require(!registeredUsers[msg.sender], "User already registered");
        
        uint256 requiredBNB = getRegistrationFeeInBNB();
        require(msg.value >= requiredBNB, "Insufficient registration fee");

        // Mark user as registered before external interactions
        registeredUsers[msg.sender] = true;

        // Transfer exact fee to platform wallet
        (bool success, ) = payable(platformFeeRecipient).call{value: requiredBNB}("");
        require(success, "Failed to send registration fee");

        // Refund any excess value sent as buffer back to the user
        uint256 excess = msg.value - requiredBNB;
        if (excess > 0) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: excess}("");
            require(refundSuccess, "Failed to refund excess payment");
        }
        
        emit UserRegistered(msg.sender, requiredBNB);
    }

    /**
     * @notice Get current BNB/USD price from Chainlink oracle
     * @return price BNB/USD price with 8 decimals
     */
    function getBNBUSDPrice() public view returns (uint256) {
        (, int256 price, , uint256 updatedAt, ) = bnbUsdPriceFeed.latestRoundData();
        require(price > 0, "Invalid price feed");
        require(block.timestamp - updatedAt <= 1 hours, "Price feed stale");
        return uint256(price);
    }

    /**
     * @notice Calculate registration fee in BNB
     * @return fee Registration fee in BNB (wei)
     */
    function getRegistrationFeeInBNB() public view returns (uint256) {
        uint256 bnbUsdPrice = getBNBUSDPrice(); // 8 decimals
        // registrationFeeUSD is in dollars, bnbUsdPrice has 8 decimals
        // fee = (registrationFeeUSD * 10^26) / bnbUsdPrice
        // This gives us BNB in wei (18 decimals)
        return (registrationFeeUSD * 1e26) / bnbUsdPrice;
    }

    function createMarket(
        string memory title,
        string memory description,
        string memory category,
        uint256 deadline
    ) external payable returns (uint256 marketId) {
        uint256 stakeAmount = createMarketStake;
        uint256 registrationFee = registeredUsers[msg.sender] ? 0 : getRegistrationFeeInBNB();
        uint256 totalRequired = stakeAmount + registrationFee;
        require(msg.value >= totalRequired, "Insufficient stake and fee");
        require(deadline > block.timestamp, "Deadline must be in the future");
        require(bytes(title).length >= 10, "Title too short");
        require(bytes(description).length >= 50, "Description too short");

        if (registrationFee > 0) {
            registeredUsers[msg.sender] = true;
        }

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
            creatorStake: stakeAmount,
            creatorFeeAccrued: 0
        });

        if (registrationFee > 0) {
            (bool feeSuccess, ) = payable(platformFeeRecipient).call{value: registrationFee}("");
            require(feeSuccess, "Failed to send registration fee");
            emit UserRegistered(msg.sender, registrationFee);
        }

        uint256 excess = msg.value - totalRequired;
        if (excess > 0) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: excess}("");
            require(refundSuccess, "Failed to refund excess payment");
        }

        emit MarketCreated(marketId, msg.sender, title, deadline);
        return marketId;
    }

    function placeBet(uint256 marketId, bool prediction)
        external
        payable
        requiresRegistration
        marketExists(marketId)
        marketNotResolved(marketId)
        beforeDeadline(marketId)
    {
        require(msg.value >= minBetAmount, "Bet amount too low");
        require(marketUserBets[marketId][msg.sender].amount == 0, "Already bet on this market");

        Market storage market = markets[marketId];
        
        // Calculate fees: 10% platform + 2% creator = 12% total
        uint256 platformFee = (msg.value * PLATFORM_FEE_BP) / BASIS_POINTS; // 10%
        uint256 creatorFee = (msg.value * CREATOR_FEE_BP) / BASIS_POINTS;   // 2%
        uint256 betAmount = msg.value - platformFee - creatorFee;            // 88%
        
        // Send platform fee immediately
        (bool success, ) = payable(platformFeeRecipient).call{value: platformFee}("");
        require(success, "Failed to send platform fee");
        
        // Accrue creator fee (paid on resolution)
        market.creatorFeeAccrued += creatorFee;
        
        // Add bet amount to pools (88% of original bet)
        if (prediction) {
            market.yesPool += betAmount;
            marketPools[marketId][true] += betAmount;
        } else {
            market.noPool += betAmount;
            marketPools[marketId][false] += betAmount;
        }
        
        market.totalPool += betAmount;
        market.participants++;

        Bet memory newBet = Bet({
            marketId: marketId,
            prediction: prediction,
            amount: msg.value, // Store original amount for user reference
            timestamp: block.timestamp,
            claimed: false
        });

        userBets[msg.sender].push(newBet);
        marketUserBets[marketId][msg.sender] = newBet;

        emit BetPlaced(marketId, msg.sender, prediction, msg.value, platformFee, creatorFee);
        emit PlatformFeeCollected(platformFee);
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

        // Pay creator: stake refund + accrued 2% creator fees
        uint256 totalPayout = market.creatorStake + market.creatorFeeAccrued;

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
        
        // Calculate user's share from the 88% pool (after 12% fees)
        uint256 platformFee = (userBet.amount * PLATFORM_FEE_BP) / BASIS_POINTS;
        uint256 creatorFee = (userBet.amount * CREATOR_FEE_BP) / BASIS_POINTS;
        uint256 userBetInPool = userBet.amount - platformFee - creatorFee;
        
        uint256 winnings;

        if (winningPool == 0) {
            // No winners, losers get refund from losing pool
            require(userBet.prediction != market.outcome, "No winners to claim from");
            winnings = (userBetInPool * market.totalPool) / losingPool;
        } else {
            // Normal case: winners split the entire pool
            require(userBet.prediction == market.outcome, "Bet lost");
            winnings = (userBetInPool * market.totalPool) / winningPool;
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

    function isUserRegistered(address user) external view returns (bool) {
        return registeredUsers[user];
    }

    function updateMinBetAmount(uint256 newMinBet) external onlyOwner {
        minBetAmount = newMinBet;
    }

    function updateCreateMarketStake(uint256 newStake) external onlyOwner {
        createMarketStake = newStake;
    }

    function updateRegistrationFeeUSD(uint256 newFeeUSD) external onlyOwner {
        require(newFeeUSD >= 1 && newFeeUSD <= 100, "Fee must be between $1 and $100");
        registrationFeeUSD = newFeeUSD;
    }

    receive() external payable {}
}
