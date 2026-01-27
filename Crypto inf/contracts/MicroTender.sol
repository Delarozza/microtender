// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title MicroTender - Simplified for Remix IDE Testing
 * @dev Smart contract для mikrotendrový системы студенческой рады
 * @author Your Name
 */
contract MicroTender {
    
    // ========== ENUMS ==========
    
    enum TenderStatus { Draft, Open, Voting, Completed, Fulfilled, Cancelled }
    enum UserRole { Member, Admin }
    
    // ========== STRUCTS ==========
    
    struct Tender {
        uint256 id;
        address creator;
        string title;
        string description;  // Popis tendru podľa požiadaviek
        uint256 maxBudget;
        string category;
        string ipfsCID;      // CID dokumentu z IPFS
        uint256 deadline;
        uint256 votingDeadline;
        TenderStatus status;
        uint256 createdAt;
    }
    
    struct Bid {
        uint256 id;
        uint256 tenderId;
        address vendor;
        uint256 price;
        uint256 deliveryTime;
        string description;
        uint256 submittedAt;
    }
    
    // ========== STATE ==========
    
    mapping(uint256 => Tender) public tenders;
    mapping(uint256 => Bid[]) public tenderBids;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(uint256 => mapping(uint256 => uint256)) public voteCount;
    mapping(address => UserRole) public userRoles;
    mapping(address => bool) public hasRole;  // Отслеживает, установлена ли роль явно
    mapping(address => bool) public registeredVendors;  // Registrovaní dodávatelia
    
    uint256 public tenderCounter;
    uint256 public bidCounter;
    address public owner;
    
    // ========== EVENTS ==========
    
    event TenderCreated(uint256 indexed tenderId, address indexed creator, string title);
    event BidSubmitted(uint256 indexed tenderId, uint256 bidId, address vendor, uint256 price);
    event VoteCasted(uint256 indexed tenderId, uint256 bidId, address voter);
    event TenderCompleted(uint256 indexed tenderId, uint256 winningBidId);
    event VendorRegistered(address indexed vendor);
    
    // ========== MODIFIERS ==========
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    modifier onlyMember() {
        require(hasRole[msg.sender] && userRoles[msg.sender] >= UserRole.Member, "Only members");
        _;
    }
    
    // ========== CONSTRUCTOR ==========
    
    constructor() {
        owner = msg.sender;
        userRoles[msg.sender] = UserRole.Admin;
        hasRole[msg.sender] = true;
    }
    
    // ========== ROLE MANAGEMENT ==========
    
    function grantRole(address _user, UserRole _role) external onlyOwner {
        userRoles[_user] = _role;
        hasRole[_user] = true;
    }
    
    function getUserRole(address _user) external view returns (UserRole) {
        return userRoles[_user];
    }
    
    // ========== TENDER FUNCTIONS ==========
    
    /**
     * @dev Vytvorenie nového tendra
     * @param _title Názov tendra (napr. "50 markerov")
     * @param _description Popis tendru
     * @param _maxBudget Maximálny rozpočet v wei
     * @param _category Kategória (napr. "Kancelárske")
     * @param _ipfsCID CID dokumentu z IPFS (môže byť prázdny string ak dokument nie je nahraný)
     */
    function createTender(
        string memory _title,
        string memory _description,
        uint256 _maxBudget,
        string memory _category,
        string memory _ipfsCID
    ) external onlyMember returns (uint256) {
        tenderCounter++;
        
        tenders[tenderCounter] = Tender({
            id: tenderCounter,
            creator: msg.sender,
            title: _title,
            description: _description,
            maxBudget: _maxBudget,
            category: _category,
            ipfsCID: _ipfsCID,
            deadline: 0,
            votingDeadline: 0,
            status: TenderStatus.Draft,
            createdAt: block.timestamp
        });
        
        emit TenderCreated(tenderCounter, msg.sender, _title);
        return tenderCounter;
    }
    
    /**
     * @dev Publikovať tender (otvoriť pre ponuky)
     */
    function publishTender(uint256 _tenderId, uint256 _daysUntilDeadline) external {
        Tender storage tender = tenders[_tenderId];
        require(tender.creator == msg.sender, "Only creator");
        require(tender.status == TenderStatus.Draft, "Already published");
        require(_daysUntilDeadline >= 3 && _daysUntilDeadline <= 30, "Invalid deadline");
        
        tender.status = TenderStatus.Open;
        tender.deadline = block.timestamp + (_daysUntilDeadline * 1 days);
    }
    
    /**
     * @dev Získať tender detaily
     */
    function getTender(uint256 _tenderId) external view returns (Tender memory) {
        return tenders[_tenderId];
    }
    
    // ========== VENDOR REGISTRATION ==========
    
    /**
     * @dev Registrovať sa ako dodávateľ
     */
    function registerAsVendor() external {
        require(!registeredVendors[msg.sender], "Already registered");
        registeredVendors[msg.sender] = true;
        emit VendorRegistered(msg.sender);
    }
    
    /**
     * @dev Skontrolovať či je adresa registrovaný dodávateľ
     */
    function isRegisteredVendor(address _vendor) external view returns (bool) {
        return registeredVendors[_vendor];
    }
    
    // ========== BID FUNCTIONS ==========
    
    /**
     * @dev Predložiť ponuku (od dodávateľa)
     * @param _tenderId ID tendra
     * @param _price Cena v wei
     * @param _deliveryTime Dodacia lehota v dňoch
     * @param _description Popis ponuky
     */
    function submitBid(
        uint256 _tenderId,
        uint256 _price,
        uint256 _deliveryTime,
        string memory _description
    ) external returns (uint256) {
        Tender storage tender = tenders[_tenderId];
        require(tender.status == TenderStatus.Open, "Not open");
        require(block.timestamp < tender.deadline, "Deadline passed");
        require(_price > 0 && _price <= tender.maxBudget, "Invalid price");
        require(registeredVendors[msg.sender], "Not registered as vendor");
        
        bidCounter++;
        
        Bid memory newBid = Bid({
            id: bidCounter,
            tenderId: _tenderId,
            vendor: msg.sender,
            price: _price,
            deliveryTime: _deliveryTime,
            description: _description,
            submittedAt: block.timestamp
        });
        
        tenderBids[_tenderId].push(newBid);
        
        emit BidSubmitted(_tenderId, bidCounter, msg.sender, _price);
        return bidCounter;
    }
    
    /**
     * @dev Získať všetky ponuky pre tender
     */
    function getTenderBids(uint256 _tenderId) external view returns (Bid[] memory) {
        return tenderBids[_tenderId];
    }
    
    /**
     * @dev Počet ponúk
     */
    function getBidCount(uint256 _tenderId) external view returns (uint256) {
        return tenderBids[_tenderId].length;
    }
    
    // ========== VOTING FUNCTIONS ==========
    
    /**
     * @dev Spustiť hlasovanie
     */
    function startVoting(uint256 _tenderId, uint256 _votingDays) external {
        Tender storage tender = tenders[_tenderId];
        require(tender.creator == msg.sender, "Only creator");
        require(tender.status == TenderStatus.Open, "Not open");
        require(tenderBids[_tenderId].length > 0, "No bids");
        
        tender.status = TenderStatus.Voting;
        tender.votingDeadline = block.timestamp + (_votingDays * 1 days);
    }
    
    /**
     * @dev Hlasovať za ponuku
     * @param _tenderId ID tendra
     * @param _bidId ID ponuky (použite ID z getTenderBids)
     */
    function castVote(uint256 _tenderId, uint256 _bidId) external onlyMember {
        Tender storage tender = tenders[_tenderId];
        require(tender.status == TenderStatus.Voting, "Not voting");
        require(!hasVoted[_tenderId][msg.sender], "Already voted");
        
        // Verify bid exists
        Bid[] memory bids = tenderBids[_tenderId];
        bool found = false;
        for (uint i = 0; i < bids.length; i++) {
            if (bids[i].id == _bidId) {
                found = true;
                break;
            }
        }
        require(found, "Bid not found");
        
        hasVoted[_tenderId][msg.sender] = true;
        voteCount[_tenderId][_bidId]++;
        
        emit VoteCasted(_tenderId, _bidId, msg.sender);
    }
    
    /**
     * @dev Získať počet hlasov
     */
    function getVoteCount(uint256 _tenderId, uint256 _bidId) external view returns (uint256) {
        return voteCount[_tenderId][_bidId];
    }
    
    /**
     * @dev Skontrolovať či používateľ hlasoval
     */
    function hasUserVoted(uint256 _tenderId, address _user) external view returns (bool) {
        return hasVoted[_tenderId][_user];
    }
    
    /**
     * @dev Finalizovať tender - určiť víťaza
     */
    function finalizeTender(uint256 _tenderId) external {
        Tender storage tender = tenders[_tenderId];
        require(tender.creator == msg.sender, "Only creator");
        require(tender.status == TenderStatus.Voting, "Not voting");
        
        // Find winner
        uint256 winningBidId = 0;
        uint256 maxVotes = 0;
        
        Bid[] memory bids = tenderBids[_tenderId];
        for (uint i = 0; i < bids.length; i++) {
            uint256 votes = voteCount[_tenderId][bids[i].id];
            if (votes > maxVotes) {
                maxVotes = votes;
                winningBidId = bids[i].id;
            }
        }
        
        require(winningBidId > 0, "No votes");
        
        tender.status = TenderStatus.Completed;
        
        emit TenderCompleted(_tenderId, winningBidId);
    }
    
    /**
     * @dev Získať víťazný bid
     */
    function getWinningBid(uint256 _tenderId) external view returns (
        uint256 bidId,
        address vendor,
        uint256 price,
        uint256 votes
    ) {
        require(tenders[_tenderId].status >= TenderStatus.Completed, "Not completed");
        
        uint256 maxVotes = 0;
        uint256 winningBidId = 0;
        address winningVendor = address(0);
        uint256 winningPrice = 0;
        
        Bid[] memory bids = tenderBids[_tenderId];
        for (uint i = 0; i < bids.length; i++) {
            uint256 currentVotes = voteCount[_tenderId][bids[i].id];
            if (currentVotes > maxVotes) {
                maxVotes = currentVotes;
                winningBidId = bids[i].id;
                winningVendor = bids[i].vendor;
                winningPrice = bids[i].price;
            }
        }
        
        return (winningBidId, winningVendor, winningPrice, maxVotes);
    }
    
    /**
     * @dev Označiť ako splnený
     */
    function fulfillTender(uint256 _tenderId) external {
        Tender storage tender = tenders[_tenderId];
        require(tender.creator == msg.sender, "Only creator");
        require(tender.status == TenderStatus.Completed, "Not completed");
        
        tender.status = TenderStatus.Fulfilled;
    }
    
    // ========== HELPER FUNCTIONS ==========
    
    /**
     * @dev Konverzia wei na human-readable format (pre debug)
     */
    function weiToEther(uint256 _wei) external pure returns (uint256) {
        return _wei / 1 ether;
    }
    
    /**
     * @dev Get current timestamp (for testing deadlines)
     */
    function getCurrentTime() external view returns (uint256) {
        return block.timestamp;
    }
}