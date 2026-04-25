# MicroTender

A decentralized micro-procurement platform for student councils built for the Web3 ecosystem on the Polygon Amoy testnet. MicroTender enables transparent, secure, and trustless creation of small-scale tenders, submission of bids, and decentralized voting to select winning proposals — with every action recorded on-chain.

## 🌟 Features

*   **Decentralized Tenders:** Transparent creation of public tenders directly on the blockchain.
*   **Immutable Bidding:** Registered vendors can submit bids with transparent pricing, delivery times, and securely attached documents via IPFS.
*   **Decentralized Voting:** Council members cast votes on submitted bids securely.
*   **Automated Winner Selection:** Smart contract logic automatically finalizes the tender and determines the winner based on transparent voting results.
*   **Secure Document Storage:** Decentralized file storage using IPFS (via Pinata) ensures that tender and bid documents cannot be tampered with.

## 🛠 Tech Stack

*   **Smart Contracts:** Solidity (0.8.19), Hardhat
*   **Frontend:** React 19 (CRA), Tailwind CSS, lucide-react
*   **Web3 Integration:** ethers.js v5
*   **Network:** Polygon Amoy Testnet
*   **Decentralized Storage:** IPFS (via Pinata)
*   **Hosting:** Vercel

## 🏗 Architecture Overview

MicroTender is composed of a robust smart contract backend and a responsive React frontend with dark mode support:

*   **Smart Contract:** Acts as the decentralized backend, handling all core business logic (tender creation, bid submission, voting, state transitions) and role-based access. It serves as the single source of truth, ensuring immutability and transparency.
*   **Frontend (React):** Provides an intuitive user interface for interacting with the blockchain. It uses `ethers.js` to communicate with the smart contract via a Web3 provider (like MetaMask) and interfaces with Pinata to upload and retrieve IPFS document hashes.
*   **Interaction Flow:** The frontend listens for smart contract events (`useNotifications` hook) to update the UI in real-time. Every tender detail page includes Polygonscan links to the contract, creator address, and transaction hashes for full transparency.

## 📜 Smart Contract Logic

**Address:** `0x1F8CCE975c9cB052Bf8c6ED04B2a9c614436C5D0`
**Network:** Polygon Amoy (Chain ID 80002)

The core logic is governed by the MicroTender smart contract, defining strict roles and a lifecycle:

### Roles
*   **Owner:** Deployer. Can grant/revoke all roles.
*   **Admin:** Can manage roles (grant Member).
*   **Member:** Council member. Can create tenders, start voting, cast votes, and finalize tenders.
*   **Vendor:** Registered supplier. Can submit bids on open tenders.

### Tender Lifecycle
1.  **Draft:** Created by a member. Can update IPFS document, publish, or cancel.
2.  **Open:** Accepts bids from vendors until the deadline.
3.  **Voting:** Members vote on submitted bids (3-14 days duration).
4.  **Completed:** Voting ended, winner determined by the highest vote count.
5.  **Fulfilled:** Creator confirms the winning vendor delivered.

## 🚀 Getting Started

Follow these instructions to set up the project locally for development and testing.

### Prerequisites

*   [Node.js](https://nodejs.org/) (v16 or higher recommended)
*   [MetaMask](https://metamask.io/) browser extension (configured for Polygon Amoy)
*   Git

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd microtender-app
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Smart Contract Deployment (Optional/Local):**
    ```bash
    npx hardhat node
    npx hardhat run scripts/deploy.js --network localhost
    ```
    *To test the contract natively:* `npx hardhat test`

4.  **Start the frontend development server:**
    ```bash
    npm start
    ```
    The application will be available at `http://localhost:3000`.

## 💻 Usage (Demo Flow)

1.  **Connect Wallet:** Click "Connect Wallet" to link your MetaMask account. The app auto-detects and prompts to switch to Polygon Amoy.
2.  **Create Tender:** As a Member, navigate to "New Tender", fill in the details, attach a document, and submit. Publish to open it for bids.
3.  **Submit Bids:** As an approved Vendor, view the active tender, enter your price and delivery time, and submit your bid.
4.  **Vote:** Once bidding closes, the Creator transitions the tender to Voting. Council Members can then review bids and cast votes.
5.  **Finalize & Fulfill:** Once the voting period is over, the Creator finalizes the tender to declare the winner. After delivery, the tender is marked as Fulfilled.

## ⚙️ Environment Variables

Create a `.env.local` file in the root directory and configure the following variables for IPFS uploads:

```env
# IPFS / Pinata
REACT_APP_PINATA_API_KEY=your_pinata_api_key
REACT_APP_PINATA_SECRET_API_KEY=your_pinata_secret_key
REACT_APP_PINATA_JWT=your_pinata_jwt_token
```

*Note: RPC endpoints (drpc.org, polygon.technology, etc.) are configured internally with fallback logic.*

## 🔒 Security Notes

*   **IPFS JWT Exposure:** Currently, the Pinata JWT/API keys are handled on the frontend for Proof-of-Concept (PoC) purposes. **Do not use this approach in production.**
*   **Recommendation:** For a production environment, implement a backend proxy server to handle IPFS uploads and securely manage API keys to prevent exposure.

## 🔮 Future Improvements

*   **Backend Indexing:** Integrate [The Graph](https://thegraph.com/) to index smart contract events for significantly faster UI rendering and complex querying without relying on RPC node event filtering.
*   **Enhanced UI/UX:** Refine the user interface with better loading states and mobile responsiveness.
*   **Contract Optimizations:** Refactor smart contract storage to further minimize gas consumption during tender creation and voting.

## 📸 Screenshots

*(Placeholder for Application Screenshots)*

*   **Dashboard**
*   **Tender Details**

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
