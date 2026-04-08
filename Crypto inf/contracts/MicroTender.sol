// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract MicroTender {

    // ========== ENUMS ==========
    enum TenderStatus { Draft, Open, Voting, Completed, Fulfilled, Cancelled }
    enum UserRole { Member, Admin }
    enum ApplicationStatus { Pending, Approved, Rejected }
    
    // ========== CONSTANTS ==========    
    uint256 public constant MIN_DEADLINE_DAYS = 3;
    uint256 public constant MAX_DEADLINE_DAYS = 14;
    uint256 public constant MIN_VOTING_DAYS = 3;
    uint256 public constant MAX_VOTING_DAYS = 14;
    /// @notice Minimum bids required before the creator can call startVoting
    uint256 public constant MIN_BIDS_FOR_VOTING = 3;
    uint256 public constant MAX_STRING_LENGTH = 200; // Максимальная длина строк
    
    // ========== STRUCTS ==========
    
    struct Tender {
        uint256 id;
        address creator;
        string title;
        string description;
        uint256 maxBudget;
        string category;
        string ipfsCID;
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
    
    struct VendorApplication {
        uint256 id;
        address applicant;
        string companyName;
        string contactInfo;
        string description;
        uint256 submittedAt;
        ApplicationStatus status;
    }
    
    // ========== STATE ==========
    
    mapping(uint256 => Tender) public tenders;
    mapping(uint256 => Bid[]) public tenderBids;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(uint256 => mapping(uint256 => uint256)) public voteCount;
    mapping(address => UserRole) public userRoles;
    mapping(address => bool) public hasRole;
    mapping(address => bool) public registeredVendors;
    mapping(uint256 => VendorApplication) public vendorApplications;
    mapping(address => uint256) public vendorApplicationByAddress;
    
    uint256 public tenderCounter;
    uint256 public bidCounter;
    uint256 public vendorApplicationCounter;
    address public owner;
    
    // ========== EVENTS ==========
    
    event TenderCreated(uint256 indexed tenderId, address indexed creator, string title);
    event TenderPublished(uint256 indexed tenderId, uint256 deadline);
    event TenderCancelled(uint256 indexed tenderId, address indexed creator);
    event BidSubmitted(uint256 indexed tenderId, uint256 bidId, address vendor, uint256 price);
    event VoteCasted(uint256 indexed tenderId, uint256 bidId, address voter);
    event TenderCompleted(uint256 indexed tenderId, uint256 winningBidId);
    event VendorRegistered(address indexed vendor);
    event VendorApplicationSubmitted(uint256 indexed applicationId, address indexed applicant, string companyName);
    event VendorApplicationApproved(uint256 indexed applicationId, address indexed vendor);
    event VendorApplicationRejected(uint256 indexed applicationId, address indexed applicant);
    event RoleGranted(address indexed user, UserRole role);
    event RoleRevoked(address indexed user);
    event IPFSCIDUpdated(uint256 indexed tenderId, string newCID);
    
    // ========== MODIFIERS ==========
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    modifier onlyMember() {
        require(hasRole[msg.sender] && userRoles[msg.sender] >= UserRole.Member, "Only members");
        _;
    }
    
    modifier validTender(uint256 _tenderId) {
        require(_tenderId > 0 && _tenderId <= tenderCounter, "Invalid tender ID");
        _;
    }
    
    modifier validApplication(uint256 _applicationId) {
        require(_applicationId > 0 && _applicationId <= vendorApplicationCounter, "Invalid application ID");
        _;
    }
    
    // ========== CONSTRUCTOR ==========
    
    constructor() {
        owner = msg.sender;
        userRoles[msg.sender] = UserRole.Admin;
        hasRole[msg.sender] = true;
        emit RoleGranted(msg.sender, UserRole.Admin);
    }
    
    // ========== ROLE MANAGEMENT ==========
    
    /**
     * @dev Выдать роль пользователю
     * @param _user Адрес пользователя
     * @param _role Роль (Member или Admin)
     */
    function grantRole(address _user, UserRole _role) external onlyOwner {
        require(_user != address(0), "Invalid address");
        userRoles[_user] = _role;
        hasRole[_user] = true;
        emit RoleGranted(_user, _role);
    }
    
    /**
     * @dev Отозвать роль у пользователя
     * @param _user Адрес пользователя
     */
    function revokeRole(address _user) external onlyOwner {
        require(_user != address(0), "Invalid address");
        require(_user != owner, "Cannot revoke owner role");
        hasRole[_user] = false;
        emit RoleRevoked(_user);
    }
    
    /**
     * @dev Получить роль пользователя
     * @param _user Адрес пользователя
     * @return Роль пользователя
     */
    function getUserRole(address _user) external view returns (UserRole) {
        return userRoles[_user];
    }
    
    // ========== TENDER FUNCTIONS ==========
    
    /**
     * @dev Создать новый тендер
     * @param _title Название тендера
     * @param _description Описание тендера
     * @param _maxBudget Максимальный бюджет в wei
     * @param _category Категория
     * @param _ipfsCID CID документа из IPFS (может быть пустым)
     * @return ID созданного тендера
     */
    function createTender(
        string memory _title,
        string memory _description,
        uint256 _maxBudget,
        string memory _category,
        string memory _ipfsCID
    ) external onlyMember returns (uint256) {
        require(bytes(_title).length > 0, "Title required");
        require(bytes(_title).length <= MAX_STRING_LENGTH, "Title too long");
        require(_maxBudget > 0, "Budget must be > 0");
        require(bytes(_category).length > 0, "Category required");
        
        // Используем unchecked для безопасного инкремента
        unchecked {
            tenderCounter++;
        }
        
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
     * @dev Опубликовать тендер (открыть для предложений)
     * @param _tenderId ID тендера
     * @param _daysUntilDeadline Количество дней до дедлайна
     */
    function publishTender(uint256 _tenderId, uint256 _daysUntilDeadline) 
        external 
        validTender(_tenderId) 
    {
        Tender storage tender = tenders[_tenderId];
        require(tender.creator == msg.sender, "Only creator");
        require(tender.status == TenderStatus.Draft, "Already published");
        require(
            _daysUntilDeadline >= MIN_DEADLINE_DAYS && _daysUntilDeadline <= MAX_DEADLINE_DAYS,
            "Invalid deadline"
        );
        
        tender.status = TenderStatus.Open;
        tender.deadline = block.timestamp + (_daysUntilDeadline * 1 days);
        
        emit TenderPublished(_tenderId, tender.deadline);
    }
    
    /**
     * @dev Отменить тендер (только создатель, только в статусе Draft или Open)
     * @param _tenderId ID тендера
     */
    function cancelTender(uint256 _tenderId) external validTender(_tenderId) {
        Tender storage tender = tenders[_tenderId];
        require(tender.creator == msg.sender, "Only creator");
        require(
            tender.status == TenderStatus.Draft || tender.status == TenderStatus.Open,
            "Cannot cancel"
        );
        
        tender.status = TenderStatus.Cancelled;
        emit TenderCancelled(_tenderId, msg.sender);
    }
    
    /**
     * @dev Обновить IPFS CID для тендера (только создатель, только в статусе Draft)
     * @param _tenderId ID тендера
     * @param _ipfsCID Новый CID документа
     */
    function updateTenderIPFSCID(uint256 _tenderId, string memory _ipfsCID) 
        external 
        validTender(_tenderId) 
    {
        Tender storage tender = tenders[_tenderId];
        require(tender.creator == msg.sender, "Only creator");
        require(tender.status == TenderStatus.Draft, "Can only update in draft");
        
        tender.ipfsCID = _ipfsCID;
        emit IPFSCIDUpdated(_tenderId, _ipfsCID);
    }
    
    /**
     * @dev Получить детали тендера
     * @param _tenderId ID тендера
     * @return Структура тендера
     */
    function getTender(uint256 _tenderId) external view validTender(_tenderId) returns (Tender memory) {
        return tenders[_tenderId];
    }
    
    // ========== VENDOR REGISTRATION ==========
    
    /**
     * @dev Подать заявку на регистрацию как поставщик
     * @param _companyName Название компании
     * @param _contactInfo Контактная информация
     * @param _description Описание компании
     */
    function submitVendorApplication(
        string memory _companyName,
        string memory _contactInfo,
        string memory _description
    ) external {
        require(!registeredVendors[msg.sender], "Already registered");
        require(vendorApplicationByAddress[msg.sender] == 0, "Application already submitted");
        require(bytes(_companyName).length > 0, "Company name required");
        require(bytes(_companyName).length <= MAX_STRING_LENGTH, "Company name too long");
        
        unchecked {
            vendorApplicationCounter++;
        }
        
        vendorApplications[vendorApplicationCounter] = VendorApplication({
            id: vendorApplicationCounter,
            applicant: msg.sender,
            companyName: _companyName,
            contactInfo: _contactInfo,
            description: _description,
            submittedAt: block.timestamp,
            status: ApplicationStatus.Pending
        });
        
        vendorApplicationByAddress[msg.sender] = vendorApplicationCounter;
        
        emit VendorApplicationSubmitted(vendorApplicationCounter, msg.sender, _companyName);
    }
    
    /**
     * @dev Одобрить заявку вендора
     * @param _applicationId ID заявки
     */
    function approveVendorApplication(uint256 _applicationId) 
        external 
        onlyMember 
        validApplication(_applicationId) 
    {
        VendorApplication storage application = vendorApplications[_applicationId];
        require(application.status == ApplicationStatus.Pending, "Application already processed");
        
        application.status = ApplicationStatus.Approved;
        registeredVendors[application.applicant] = true;
        
        emit VendorApplicationApproved(_applicationId, application.applicant);
        emit VendorRegistered(application.applicant);
    }
    
    /**
     * @dev Отклонить заявку вендора
     * @param _applicationId ID заявки
     */
    function rejectVendorApplication(uint256 _applicationId) 
        external 
        onlyMember 
        validApplication(_applicationId) 
    {
        VendorApplication storage application = vendorApplications[_applicationId];
        require(application.status == ApplicationStatus.Pending, "Application already processed");
        
        application.status = ApplicationStatus.Rejected;
        vendorApplicationByAddress[application.applicant] = 0; // Разрешить повторную подачу
        
        emit VendorApplicationRejected(_applicationId, application.applicant);
    }
    
    /**
     * @dev Получить заявку вендора
     * @param _applicationId ID заявки
     * @return Структура заявки
     */
    function getVendorApplication(uint256 _applicationId) 
        external 
        view 
        validApplication(_applicationId) 
        returns (VendorApplication memory) 
    {
        return vendorApplications[_applicationId];
    }
    
    /**
     * @dev Получить заявку по адресу вендора
     * @param _vendor Адрес вендора
     * @return Структура заявки
     */
    function getVendorApplicationByAddress(address _vendor) 
        external 
        view 
        returns (VendorApplication memory) 
    {
        require(_vendor != address(0), "Invalid address");
        uint256 appId = vendorApplicationByAddress[_vendor];
        if (appId == 0) {
            return VendorApplication(0, address(0), "", "", "", 0, ApplicationStatus.Pending);
        }
        return vendorApplications[appId];
    }
    
    /**
     * @dev Получить статус заявки вендора
     * @param _vendor Адрес вендора
     * @return Статус заявки
     */
    function getVendorApplicationStatus(address _vendor) 
        external 
        view 
        returns (ApplicationStatus) 
    {
        require(_vendor != address(0), "Invalid address");
        uint256 appId = vendorApplicationByAddress[_vendor];
        if (appId == 0) return ApplicationStatus.Pending;
        return vendorApplications[appId].status;
    }
    
    /**
     * @dev Проверить, является ли адрес зарегистрированным вендором
     * @param _vendor Адрес вендора
     * @return true если зарегистрирован
     */
    function isRegisteredVendor(address _vendor) external view returns (bool) {
        return registeredVendors[_vendor];
    }
    
    /**
     * @dev Отозвать статус вендора (может вызвать owner или сам вендор)
     * @param _vendor Адрес вендора
     */
    function revokeVendorStatus(address _vendor) external {
        require(_vendor != address(0), "Invalid address");
        require(msg.sender == owner || msg.sender == _vendor, "Not authorized");
        require(registeredVendors[_vendor], "Not a vendor");
        
        registeredVendors[_vendor] = false;
        vendorApplicationByAddress[_vendor] = 0; // Разрешить повторную подачу
    }
    
    // ========== BID FUNCTIONS ==========
    
    /**
     * @dev Подать предложение на тендер
     * @param _tenderId ID тендера
     * @param _price Цена в wei
     * @param _deliveryTime Срок доставки в днях
     * @param _description Описание предложения
     * @return ID созданного предложения
     */
    function submitBid(
        uint256 _tenderId,
        uint256 _price,
        uint256 _deliveryTime,
        string memory _description
    ) external validTender(_tenderId) returns (uint256) {
        Tender storage tender = tenders[_tenderId];
        require(tender.status == TenderStatus.Open, "Not open");
        require(block.timestamp < tender.deadline, "Deadline passed");
        require(_price > 0 && _price <= tender.maxBudget, "Invalid price");
        require(_deliveryTime > 0, "Delivery time must be > 0");
        require(registeredVendors[msg.sender], "Not registered as vendor");
        
        unchecked {
            bidCounter++;
        }
        
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
     * @dev Получить все предложения для тендера
     * @param _tenderId ID тендера
     * @return Массив предложений
     */
    function getTenderBids(uint256 _tenderId) 
        external 
        view 
        validTender(_tenderId) 
        returns (Bid[] memory) 
    {
        return tenderBids[_tenderId];
    }
    
    /**
     * @dev Получить количество предложений для тендера
     * @param _tenderId ID тендера
     * @return Количество предложений
     */
    function getBidCount(uint256 _tenderId) 
        external 
        view 
        validTender(_tenderId) 
        returns (uint256) 
    {
        return tenderBids[_tenderId].length;
    }
    
    // ========== VOTING FUNCTIONS ==========
    
    /**
     * @dev Начать голосование (минимум MIN_BIDS_FOR_VOTING предложений)
     * @param _tenderId ID тендера
     * @param _votingDays Количество дней для голосования
     */
    function startVoting(uint256 _tenderId, uint256 _votingDays) 
        external 
        validTender(_tenderId) 
    {
        Tender storage tender = tenders[_tenderId];
        require(tender.creator == msg.sender, "Only creator");
        require(tender.status == TenderStatus.Open, "Not open");
        require(
            tenderBids[_tenderId].length >= MIN_BIDS_FOR_VOTING,
            "Need at least 3 bids"
        );
        require(
            _votingDays >= MIN_VOTING_DAYS && _votingDays <= MAX_VOTING_DAYS,
            "Invalid voting days"
        );
        
        tender.status = TenderStatus.Voting;
        tender.votingDeadline = block.timestamp + (_votingDays * 1 days);
    }
    
    /**
     * @dev Проголосовать за предложение
     * @param _tenderId ID тендера
     * @param _bidId ID предложения
     */
    function castVote(uint256 _tenderId, uint256 _bidId) 
        external 
        onlyMember 
        validTender(_tenderId) 
    {
        Tender storage tender = tenders[_tenderId];
        require(tender.status == TenderStatus.Voting, "Not voting");
        require(block.timestamp < tender.votingDeadline, "Voting deadline passed");
        require(!hasVoted[_tenderId][msg.sender], "Already voted");
        
        // Оптимизированная проверка существования предложения
        Bid[] storage bids = tenderBids[_tenderId];
        bool found = false;
        uint256 bidsLength = bids.length;
        
        for (uint256 i = 0; i < bidsLength; ) {
            if (bids[i].id == _bidId) {
                found = true;
                break;
            }
            unchecked {
                i++;
            }
        }
        
        require(found, "Bid not found");
        
        hasVoted[_tenderId][msg.sender] = true;
        
        unchecked {
            voteCount[_tenderId][_bidId]++;
        }
        
        emit VoteCasted(_tenderId, _bidId, msg.sender);
    }
    
    /**
     * @dev Получить количество голосов за предложение
     * @param _tenderId ID тендера
     * @param _bidId ID предложения
     * @return Количество голосов
     */
    function getVoteCount(uint256 _tenderId, uint256 _bidId) 
        external 
        view 
        validTender(_tenderId) 
        returns (uint256) 
    {
        return voteCount[_tenderId][_bidId];
    }
    
    /**
     * @dev Проверить, голосовал ли пользователь
     * @param _tenderId ID тендера
     * @param _user Адрес пользователя
     * @return true если голосовал
     */
    function hasUserVoted(uint256 _tenderId, address _user) 
        external 
        view 
        validTender(_tenderId) 
        returns (bool) 
    {
        return hasVoted[_tenderId][_user];
    }
    
    /**
     * @dev Завершить тендер и определить победителя
     * @param _tenderId ID тендера
     */
    function finalizeTender(uint256 _tenderId) external validTender(_tenderId) {
        Tender storage tender = tenders[_tenderId];
        require(tender.creator == msg.sender, "Only creator");
        require(tender.status == TenderStatus.Voting, "Not voting");
        require(
            block.timestamp >= tender.votingDeadline,
            "Voting not finished"
        );
        
        Bid[] storage bids = tenderBids[_tenderId];
        require(bids.length > 0, "No bids");
        
        // Найти победителя (оптимизированный цикл)
        uint256 winningBidId = 0;
        uint256 maxVotes = 0;
        uint256 bidsLength = bids.length;
        
        for (uint256 i = 0; i < bidsLength; ) {
            uint256 votes = voteCount[_tenderId][bids[i].id];
            if (votes > maxVotes) {
                maxVotes = votes;
                winningBidId = bids[i].id;
            }
            unchecked {
                i++;
            }
        }
        
        require(winningBidId > 0 && maxVotes > 0, "No votes");
        
        tender.status = TenderStatus.Completed;
        
        emit TenderCompleted(_tenderId, winningBidId);
    }
    
    /**
     * @dev Получить информацию о победителе
     * @param _tenderId ID тендера
     * @return bidId ID победившего предложения
     * @return vendor Адрес вендора-победителя
     * @return price Цена предложения
     * @return votes Количество голосов
     */
    function getWinningBid(uint256 _tenderId) 
        external 
        view 
        validTender(_tenderId) 
        returns (
            uint256 bidId,
            address vendor,
            uint256 price,
            uint256 votes
        ) 
    {
        require(tenders[_tenderId].status >= TenderStatus.Completed, "Not completed");
        
        Bid[] storage bids = tenderBids[_tenderId];
        uint256 maxVotes = 0;
        uint256 winningBidId = 0;
        address winningVendor = address(0);
        uint256 winningPrice = 0;
        uint256 bidsLength = bids.length;
        
        for (uint256 i = 0; i < bidsLength; ) {
            uint256 currentVotes = voteCount[_tenderId][bids[i].id];
            if (currentVotes > maxVotes) {
                maxVotes = currentVotes;
                winningBidId = bids[i].id;
                winningVendor = bids[i].vendor;
                winningPrice = bids[i].price;
            }
            unchecked {
                i++;
            }
        }
        
        return (winningBidId, winningVendor, winningPrice, maxVotes);
    }
    
    /**
     * @dev Отметить тендер как выполненный
     * @param _tenderId ID тендера
     */
    function fulfillTender(uint256 _tenderId) external validTender(_tenderId) {
        Tender storage tender = tenders[_tenderId];
        require(tender.creator == msg.sender, "Only creator");
        require(tender.status == TenderStatus.Completed, "Not completed");
        
        tender.status = TenderStatus.Fulfilled;
    }
    
    // ========== HELPER FUNCTIONS ==========
    
    /**
     * @dev Конвертация wei в ether (для отладки)
     * @param _wei Количество wei
     * @return Количество ether
     */
    function weiToEther(uint256 _wei) external pure returns (uint256) {
        return _wei / 1 ether;
    }
    
    /**
     * @dev Получить текущий timestamp (для тестирования дедлайнов)
     * @return Текущий timestamp
     */
    function getCurrentTime() external view returns (uint256) {
        return block.timestamp;
    }
}
