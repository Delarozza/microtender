/**
 * @fileoverview Hardhat тесты для MicroTender smart contract
 * 
 * Для запуска тестов:
 * npx hardhat test test/MicroTender.test.js
 */

const { expect } = require("chai");
const hre = require("hardhat");
const { ethers } = hre;

describe("MicroTender", function () {
  let microTender;
  let owner;
  let member;
  let vendor;
  let vendor2;
  let other;

  beforeEach(async function () {
    // Получаем тестовые аккаунты
    [owner, member, vendor, vendor2, other] = await ethers.getSigners();

    // Развертываем контракт
    const MicroTender = await ethers.getContractFactory("MicroTender");
    microTender = await MicroTender.deploy();
    await microTender.waitForDeployment();

    // Назначаем member роль Member
    await microTender.grantRole(member.address, 0); // 0 = Member
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await microTender.owner()).to.equal(owner.address);
    });

    it("Should set owner as Admin", async function () {
      const role = await microTender.getUserRole(owner.address);
      expect(role).to.equal(1); // 1 = Admin
    });

    it("Should initialize counters to 0", async function () {
      expect(await microTender.tenderCounter()).to.equal(0);
      expect(await microTender.bidCounter()).to.equal(0);
    });
  });

  describe("Role Management", function () {
    it("Should allow owner to grant Member role", async function () {
      await microTender.grantRole(other.address, 0);
      const role = await microTender.getUserRole(other.address);
      expect(role).to.equal(0); // Member
    });

    it("Should allow owner to grant Admin role", async function () {
      await microTender.grantRole(other.address, 1);
      const role = await microTender.getUserRole(other.address);
      expect(role).to.equal(1); // Admin
    });

    it("Should not allow non-owner to grant roles", async function () {
      await expect(
        microTender.connect(member).grantRole(other.address, 0)
      ).to.be.revertedWith("Only owner");
    });
  });

  describe("Tender Creation", function () {
    it("Should allow Member to create tender", async function () {
      const title = "Nákup 50 markerov";
      const description = "Potrebujeme 50 markerov pre študentov";
      const maxBudget = ethers.parseEther("1.0"); // 1 ETH
      const category = "Kancelárske potreby";
      const ipfsCID = "QmTest123";
      await expect(
        microTender.connect(member).createTender(
          title,
          description,
          maxBudget,
          category,
          ipfsCID
        )
      )
        .to.emit(microTender, "TenderCreated")
        .withArgs(1, member.address, title);

      const tender = await microTender.getTender(1);
      expect(tender.title).to.equal(title);
      expect(tender.description).to.equal(description);
      expect(tender.maxBudget).to.equal(maxBudget);
      expect(tender.category).to.equal(category);
      expect(tender.ipfsCID).to.equal(ipfsCID);
      expect(tender.status).to.equal(0); // Draft
      expect(await microTender.tenderCounter()).to.equal(1);
    });

    it("Should not allow non-member to create tender", async function () {
      const title = "Nákup 50 markerov";
      const description = "Potrebujeme 50 markerov pre študentov";
      const maxBudget = ethers.parseEther("1.0");
      const category = "Kancelárske potreby";
      const ipfsCID = "QmTest123";
      
      // Проверяем, что vendor не имеет установленной роли
      const hasVendorRole = await microTender.hasRole(vendor.address);
      expect(hasVendorRole).to.be.false;
      
      await expect(
        microTender.connect(vendor).createTender(
          title,
          description,
          maxBudget,
          category,
          ipfsCID
        )
      ).to.be.revertedWith("Only members");
    });

    it("Should increment tender counter", async function () {
      const title = "Nákup 50 markerov";
      const description = "Potrebujeme 50 markerov pre študentov";
      const maxBudget = ethers.parseEther("1.0");
      const category = "Kancelárske potreby";
      
      await microTender.connect(member).createTender(
        title,
        description,
        maxBudget,
        category,
        ""
      );
      await microTender.connect(member).createTender(
        "Tender 2",
        "Description 2",
        maxBudget,
        category,
        ""
      );
      expect(await microTender.tenderCounter()).to.equal(2);
    });
  });

  describe("Tender Publishing", function () {
    let tenderId;

    beforeEach(async function () {
      const maxBudget = ethers.parseEther("1.0");
      const tx = await microTender.connect(member).createTender(
        "Test Tender",
        "Test Description",
        maxBudget,
        "Kancelárske",
        ""
      );
      const receipt = await tx.wait();
      // В ethers v6 события доступны через logs
      const event = receipt.logs.find(log => {
        try {
          const parsed = microTender.interface.parseLog(log);
          return parsed && parsed.name === "TenderCreated";
        } catch {
          return false;
        }
      });
      const parsedEvent = microTender.interface.parseLog(event);
      tenderId = parsedEvent.args.tenderId;
    });

    it("Should allow creator to publish tender", async function () {
      await microTender.connect(member).publishTender(tenderId, 7);
      const tender = await microTender.getTender(tenderId);
      expect(tender.status).to.equal(1); // Open
      expect(tender.deadline).to.be.gt(0);
    });

    it("Should not allow non-creator to publish", async function () {
      await expect(
        microTender.connect(other).publishTender(tenderId, 7)
      ).to.be.revertedWith("Only creator");
    });

    it("Should reject invalid deadline (less than 3 days)", async function () {
      await expect(
        microTender.connect(member).publishTender(tenderId, 2)
      ).to.be.revertedWith("Invalid deadline");
    });

    it("Should reject invalid deadline (more than 30 days)", async function () {
      await expect(
        microTender.connect(member).publishTender(tenderId, 31)
      ).to.be.revertedWith("Invalid deadline");
    });

    it("Should not allow publishing already published tender", async function () {
      await microTender.connect(member).publishTender(tenderId, 7);
      await expect(
        microTender.connect(member).publishTender(tenderId, 7)
      ).to.be.revertedWith("Already published");
    });
  });

  describe("Vendor Registration", function () {
    it("Should allow anyone to submit vendor application and be approved", async function () {
      await expect(
        microTender.connect(vendor).submitVendorApplication("Firma s.r.o.", "info@firma.sk", "Dodávateľ IT")
      ).to.emit(microTender, "VendorApplicationSubmitted");

      await expect(microTender.connect(member).approveVendorApplication(1))
        .to.emit(microTender, "VendorApplicationApproved");

      expect(await microTender.isRegisteredVendor(vendor.address)).to.be.true;
    });

    it("Should not allow double application while pending", async function () {
      await microTender.connect(vendor).submitVendorApplication("Firma s.r.o.", "info@firma.sk", "Opis");
      await expect(
        microTender.connect(vendor).submitVendorApplication("Firma s.r.o.", "info@firma.sk", "Opis")
      ).to.be.reverted;
    });

    it("Should return false for unregistered vendor", async function () {
      expect(await microTender.isRegisteredVendor(vendor.address)).to.be.false;
    });
  });

  describe("Bid Submission", function () {
    let tenderId;

    beforeEach(async function () {
      const maxBudget = ethers.parseEther("1.0");
      // Создаем и публикуем tender
      const tx = await microTender.connect(member).createTender(
        "Test Tender",
        "Test Description",
        maxBudget,
        "Kancelárske",
        ""
      );
      const receipt = await tx.wait();
      // В ethers v6 события доступны через logs
      const event = receipt.logs.find(log => {
        try {
          const parsed = microTender.interface.parseLog(log);
          return parsed && parsed.name === "TenderCreated";
        } catch {
          return false;
        }
      });
      const parsedEvent = microTender.interface.parseLog(event);
      tenderId = parsedEvent.args.tenderId;
      await microTender.connect(member).publishTender(tenderId, 7);

      // Регистрируем vendor через application flow
      await microTender.connect(vendor).submitVendorApplication("Firma", "info@f.sk", "Opis");
      await microTender.connect(member).approveVendorApplication(1);
    });

    it("Should allow registered vendor to submit bid", async function () {
      const bidPrice = ethers.parseEther("0.5");
      await expect(
        microTender.connect(vendor).submitBid(
          tenderId,
          bidPrice,
          7,
          "Moja ponuka"
        )
      )
        .to.emit(microTender, "BidSubmitted")
        .withArgs(tenderId, 1, vendor.address, bidPrice);

      const bids = await microTender.getTenderBids(tenderId);
      expect(bids.length).to.equal(1);
      expect(bids[0].price).to.equal(bidPrice);
      expect(bids[0].vendor).to.equal(vendor.address);
    });

    it("Should not allow unregistered vendor to submit bid", async function () {
      const bidPrice = ethers.parseEther("0.5");
      await expect(
        microTender.connect(vendor2).submitBid(
          tenderId,
          bidPrice,
          7,
          "Moja ponuka"
        )
      ).to.be.revertedWith("Not registered as vendor");
    });

    it("Should not allow bid on draft tender", async function () {
      const maxBudget = ethers.parseEther("1.0");
      const bidPrice = ethers.parseEther("0.5");
      // Создаем новый tender, но не публикуем
      const tx2 = await microTender.connect(member).createTender(
        "Draft Tender",
        "Description",
        maxBudget,
        "Kancelárske",
        ""
      );
      const receipt2 = await tx2.wait();
      const event2 = receipt2.logs.find(log => {
        try {
          const parsed = microTender.interface.parseLog(log);
          return parsed && parsed.name === "TenderCreated";
        } catch {
          return false;
        }
      });
      const parsedEvent2 = microTender.interface.parseLog(event2);
      const draftTenderId = parsedEvent2.args.tenderId;

      await expect(
        microTender.connect(vendor).submitBid(
          draftTenderId,
          bidPrice,
          7,
          "Moja ponuka"
        )
      ).to.be.revertedWith("Not open");
    });

    it("Should not allow bid exceeding max budget", async function () {
      const tooHighPrice = ethers.parseEther("2.0");
      await expect(
        microTender.connect(vendor).submitBid(
          tenderId,
          tooHighPrice,
          7,
          "Moja ponuka"
        )
      ).to.be.revertedWith("Invalid price");
    });

    it("Should not allow zero price bid", async function () {
      await expect(
        microTender.connect(vendor).submitBid(
          tenderId,
          0,
          7,
          "Moja ponuka"
        )
      ).to.be.revertedWith("Invalid price");
    });

    it("Should increment bid counter", async function () {
      const bidPrice = ethers.parseEther("0.5");
      await microTender.connect(vendor).submitBid(
        tenderId,
        bidPrice,
        7,
        "Ponuka 1"
      );
      await microTender.connect(vendor).submitBid(
        tenderId,
        bidPrice,
        7,
        "Ponuka 2"
      );
      expect(await microTender.bidCounter()).to.equal(2);
    });
  });

  describe("Voting", function () {
    let tenderId;
    let bidId1, bidId2;

    beforeEach(async function () {
      const maxBudget = ethers.parseEther("1.0");
      const bidPrice = ethers.parseEther("0.5");
      // Создаем tender
      const tx = await microTender.connect(member).createTender(
        "Voting Test",
        "Description",
        maxBudget,
        "Kancelárske",
        ""
      );
      const receipt = await tx.wait();
      // В ethers v6 события доступны через logs
      const event = receipt.logs.find(log => {
        try {
          const parsed = microTender.interface.parseLog(log);
          return parsed && parsed.name === "TenderCreated";
        } catch {
          return false;
        }
      });
      const parsedEvent = microTender.interface.parseLog(event);
      tenderId = parsedEvent.args.tenderId;
      await microTender.connect(member).publishTender(tenderId, 7);

      // Регистрируем vendors через application flow
      await microTender.connect(vendor).submitVendorApplication("Firma A", "a@f.sk", "Opis");
      await microTender.connect(member).approveVendorApplication(1);
      await microTender.connect(vendor2).submitVendorApplication("Firma B", "b@f.sk", "Opis");
      await microTender.connect(member).approveVendorApplication(2);

      const tx1 = await microTender.connect(vendor).submitBid(
        tenderId,
        bidPrice,
        7,
        "Ponuka 1"
      );
      const receipt1 = await tx1.wait();
      const event1 = receipt1.logs.find(log => {
        try {
          const parsed = microTender.interface.parseLog(log);
          return parsed && parsed.name === "BidSubmitted";
        } catch {
          return false;
        }
      });
      const parsedEvent1 = microTender.interface.parseLog(event1);
      bidId1 = parsedEvent1.args.bidId;

      const tx2 = await microTender.connect(vendor2).submitBid(
        tenderId,
        bidPrice,
        5,
        "Ponuka 2"
      );
      const receipt2 = await tx2.wait();
      const event2 = receipt2.logs.find(log => {
        try {
          const parsed = microTender.interface.parseLog(log);
          return parsed && parsed.name === "BidSubmitted";
        } catch {
          return false;
        }
      });
      const parsedEvent2 = microTender.interface.parseLog(event2);
      bidId2 = parsedEvent2.args.bidId;

      // Начинаем голосование
      await microTender.connect(member).startVoting(tenderId, 3);
    });

    it("Should allow Member to vote", async function () {
      await expect(
        microTender.connect(member).castVote(tenderId, bidId1)
      )
        .to.emit(microTender, "VoteCasted")
        .withArgs(tenderId, bidId1, member.address);

      expect(await microTender.getVoteCount(tenderId, bidId1)).to.equal(1);
      expect(await microTender.hasUserVoted(tenderId, member.address)).to.be.true;
    });

    it("Should not allow non-member to vote", async function () {
      const hasVendorRole = await microTender.hasRole(vendor.address);
      expect(hasVendorRole).to.be.false;
      
      await expect(
        microTender.connect(vendor).castVote(tenderId, bidId1)
      ).to.be.revertedWith("Only members");
    });

    it("Should not allow voting twice", async function () {
      await microTender.connect(member).castVote(tenderId, bidId1);
      await expect(
        microTender.connect(member).castVote(tenderId, bidId2)
      ).to.be.revertedWith("Already voted");
    });

    it("Should not allow voting on non-voting tender", async function () {
      const maxBudget = ethers.parseEther("1.0");
      const tx = await microTender.connect(member).createTender(
        "Open Tender",
        "Description",
        maxBudget,
        "Kancelárske",
        ""
      );
      const receipt = await tx.wait();
      const event = receipt.logs.find(log => {
        try {
          const parsed = microTender.interface.parseLog(log);
          return parsed && parsed.name === "TenderCreated";
        } catch {
          return false;
        }
      });
      const parsedEvent = microTender.interface.parseLog(event);
      const openTenderId = parsedEvent.args.tenderId;
      await microTender.connect(member).publishTender(openTenderId, 7);

      await expect(
        microTender.connect(member).castVote(openTenderId, bidId1)
      ).to.be.revertedWith("Not voting");
    });

    it("Should accumulate votes correctly", async function () {
      await microTender.grantRole(other.address, 0);

      await microTender.connect(member).castVote(tenderId, bidId1);
      await microTender.connect(other).castVote(tenderId, bidId1);

      expect(await microTender.getVoteCount(tenderId, bidId1)).to.equal(2);
    });
  });

  describe("Tender Finalization", function () {
    let tenderId;
    let bidId1, bidId2;

    beforeEach(async function () {
      const maxBudget = ethers.parseEther("1.0");
      const bidPrice = ethers.parseEther("0.5");
      // Создаем tender
      const tx = await microTender.connect(member).createTender(
        "Finalization Test",
        "Description",
        maxBudget,
        "Kancelárske",
        ""
      );
      const receipt = await tx.wait();
      // В ethers v6 события доступны через logs
      const event = receipt.logs.find(log => {
        try {
          const parsed = microTender.interface.parseLog(log);
          return parsed && parsed.name === "TenderCreated";
        } catch {
          return false;
        }
      });
      const parsedEvent = microTender.interface.parseLog(event);
      tenderId = parsedEvent.args.tenderId;
      await microTender.connect(member).publishTender(tenderId, 7);

      // Регистрируем vendors через application flow
      await microTender.connect(vendor).submitVendorApplication("Firma A", "a@f.sk", "Opis");
      await microTender.connect(member).approveVendorApplication(1);
      await microTender.connect(vendor2).submitVendorApplication("Firma B", "b@f.sk", "Opis");
      await microTender.connect(member).approveVendorApplication(2);

      const tx1 = await microTender.connect(vendor).submitBid(
        tenderId,
        bidPrice,
        7,
        "Ponuka 1"
      );
      const receipt1 = await tx1.wait();
      const event1 = receipt1.logs.find(log => {
        try {
          const parsed = microTender.interface.parseLog(log);
          return parsed && parsed.name === "BidSubmitted";
        } catch {
          return false;
        }
      });
      const parsedEvent1 = microTender.interface.parseLog(event1);
      bidId1 = parsedEvent1.args.bidId;

      const tx2 = await microTender.connect(vendor2).submitBid(
        tenderId,
        bidPrice,
        5,
        "Ponuka 2"
      );
      const receipt2 = await tx2.wait();
      const event2 = receipt2.logs.find(log => {
        try {
          const parsed = microTender.interface.parseLog(log);
          return parsed && parsed.name === "BidSubmitted";
        } catch {
          return false;
        }
      });
      const parsedEvent2 = microTender.interface.parseLog(event2);
      bidId2 = parsedEvent2.args.bidId;

      // Начинаем голосование
      await microTender.connect(member).startVoting(tenderId, 3);
    });

    it("Should allow creator to finalize tender", async function () {
      await microTender.connect(member).castVote(tenderId, bidId1);

      // Advance time past the 3-day voting deadline
      await hre.network.provider.send("evm_increaseTime", [3 * 24 * 60 * 60 + 1]);
      await hre.network.provider.send("evm_mine");

      await expect(
        microTender.connect(member).finalizeTender(tenderId)
      )
        .to.emit(microTender, "TenderCompleted")
        .withArgs(tenderId, bidId1);

      const tender = await microTender.getTender(tenderId);
      expect(tender.status).to.equal(3); // Completed
    });

    it("Should not allow non-creator to finalize", async function () {
      await microTender.connect(member).castVote(tenderId, bidId1);

      await hre.network.provider.send("evm_increaseTime", [3 * 24 * 60 * 60 + 1]);
      await hre.network.provider.send("evm_mine");

      await expect(
        microTender.connect(other).finalizeTender(tenderId)
      ).to.be.revertedWith("Only creator");
    });

    it("Should not allow finalization without votes", async function () {
      await hre.network.provider.send("evm_increaseTime", [3 * 24 * 60 * 60 + 1]);
      await hre.network.provider.send("evm_mine");

      await expect(
        microTender.connect(member).finalizeTender(tenderId)
      ).to.be.revertedWith("No votes");
    });

    it("Should select bid with most votes", async function () {
      await microTender.grantRole(other.address, 0);

      await microTender.connect(member).castVote(tenderId, bidId1);
      await microTender.connect(other).castVote(tenderId, bidId1);

      await hre.network.provider.send("evm_increaseTime", [3 * 24 * 60 * 60 + 1]);
      await hre.network.provider.send("evm_mine");

      await microTender.connect(member).finalizeTender(tenderId);

      const [winningBidId] = await microTender.getWinningBid(tenderId);
      expect(winningBidId).to.equal(bidId1);
    });
  });

  describe("Helper Functions", function () {
    it("Should convert wei to ether correctly", async function () {
      const wei = ethers.parseEther("1.5");
      const ether = await microTender.weiToEther(wei);
      // weiToEther возвращает wei / 1 ether, что равно 1.5, но в BigNumber это будет 1 (целое число)
      expect(Number(ether)).to.equal(1);
    });

    it("Should return current timestamp", async function () {
      const time = await microTender.getCurrentTime();
      expect(time).to.be.gt(0);
    });
  });
});
