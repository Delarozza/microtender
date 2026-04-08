# MicroTender

Decentralized micro-procurement platform for student councils. Built on Polygon Amoy testnet, it enables transparent creation, bidding, voting, and fulfillment of small-scale tenders — with every action recorded on-chain.

## Architecture

```
React (CRA) + ethers.js v5  <-->  MicroTender.sol (Solidity 0.8.19)  <-->  Polygon Amoy
      |                                     |
      |--- Tailwind CSS (dark mode)         |--- Role-based access (Owner, Admin, Member, Vendor)
      |--- Pinata / IPFS (documents)        |--- Tender lifecycle (Draft -> Open -> Voting -> Completed -> Fulfilled)
```

## Smart Contract

**Address:** `0x1F8CCE975c9cB052Bf8c6ED04B2a9c614436C5D0`
**Network:** Polygon Amoy (Chain ID 80002)
**Source:** `Crypto inf/contracts/MicroTender.sol`

### Roles

| Role | Description |
|------|-------------|
| Owner | Deployer. Can grant/revoke all roles. |
| Admin | Can manage roles (grant Member). |
| Member | Council member. Can create tenders, start voting, cast votes, finalize tenders. |
| Vendor | Registered supplier. Can submit bids on open tenders. |

### Tender Lifecycle

```
Draft --> Open --> Voting --> Completed --> Fulfilled
  |         |                                  
  |         +------> Cancelled                 
  +-------------> Cancelled                    
```

- **Draft:** Created by a member. Can update IPFS document, publish, or cancel.
- **Open:** Accepts bids from vendors until the deadline.
- **Voting:** Members vote on submitted bids. Creator sets voting duration (3–14 days).
- **Completed:** Voting ended, winner determined by vote count.
- **Fulfilled:** Creator confirms the winning vendor delivered.
- **Cancelled:** Creator cancelled the tender (only from Draft or Open).

### Key Functions

| Function | Access | Description |
|----------|--------|-------------|
| `createTender` | Member | Create a draft tender with title, description, budget, category, IPFS CID. |
| `publishTender` | Creator | Open the draft for bids with a deadline (3–14 days). |
| `submitBid` | Vendor | Submit a bid with price, delivery time, and description. |
| `startVoting` | Creator | Transition from Open to Voting (requires at least 3 bids). |
| `castVote` | Member | Vote for a bid (one vote per member per tender). |
| `finalizeTender` | Creator | Close voting, determine winner by highest vote count. |
| `fulfillTender` | Creator | Confirm delivery by the winning vendor. |
| `cancelTender` | Creator | Cancel a Draft or Open tender. |
| `updateTenderIPFSCID` | Creator | Update the attached document while still in Draft. |
| `submitVendorApplication` | Anyone | Apply to become a registered vendor. |
| `approveVendorApplication` | Member | Approve a vendor application. |
| `rejectVendorApplication` | Member | Reject a vendor application. |
| `grantRole` | Owner | Assign Member or Admin role to an address. |

### Events

`TenderCreated`, `TenderPublished`, `TenderCancelled`, `TenderCompleted`, `BidSubmitted`, `VoteCasted`, `VendorApplicationSubmitted`, `VendorApplicationApproved`, `VendorApplicationRejected`, `VendorRegistered`, `RoleGranted`, `RoleRevoked`, `IPFSCIDUpdated`.

## Frontend

Single-page React application with sidebar navigation and full dark mode support.

### Project Structure

```
src/
  App.jsx                          Main component: wallet connection, contract interaction, routing
  components/
    Header.jsx                     Top bar: search, notifications, wallet info, disconnect
    Sidebar.jsx                    Navigation menu, user profile display
    screens/
      Dashboard.jsx                Overview stats, quick actions, recent tenders
      CreateTender.jsx             New tender form: `createTender` + `publishTender` in one action (two transactions)
      MyTenders.jsx                Tenders created by the connected wallet
      AllTenders.jsx               Full list of all tenders in the system
      TenderDetail.jsx             Tender info, bids, voting, lifecycle actions, on-chain verification links
      Voting.jsx                   Dedicated voting screen for tenders in Voting state
      VendorRegistration.jsx       Vendor application form
      VendorApproval.jsx           Approve/reject vendor applications (council members)
      Reports.jsx                  Analytics: stats, charts by status and category, top tenders
      Settings.jsx                 User profile, role management, contract info, theme toggle
  hooks/
    useNotifications.js            Real-time contract event listener, persists to localStorage
  utils/
    explorer.js                    Polygonscan URL helpers, short address formatter
    pinata.js                      IPFS file upload via Pinata API
    category.js                    Tender category icons and labels
```

### Key Technical Details

- **Wallet:** MetaMask integration via `ethers.js`. Auto-detects network and prompts to switch to Polygon Amoy.
- **RPC:** Multiple fallback endpoints (`drpc.org`, `polygon.technology`, `publicnode.com`, `blockpi.network`) with retry logic for intermittent failures.
- **Notifications:** `useNotifications` hook subscribes to contract events and stores notifications in `localStorage` (max 50).
- **IPFS:** Documents uploaded to Pinata, CID stored on-chain. Viewable via `ipfs.io` gateway.
- **Dark mode:** Tailwind `class` strategy with `localStorage` persistence. Toggle in Settings.
- **Amounts:** Budget and bid prices are entered and displayed in EUR; on-chain values use `parseEther` / `formatEther` as numeric storage (not tied to live ETH price).
- **Transparency:** Every tender detail page includes Polygonscan links to the contract, creator address, and transaction hashes.

## Configuration

| File | Purpose |
|------|---------|
| `tailwind.config.js` | Tailwind with `darkMode: 'class'` |
| `hardhat.config.js` | Solidity 0.8.19, optimizer enabled (200 runs) |
| `.env.local` | `REACT_APP_PINATA_JWT` for IPFS uploads |

## Development

```bash
npm install
npm start           # http://localhost:3000
```

## Testing

```bash
npx hardhat test    # Smart contract tests
```

Test file: `test/MicroTender.test.js`. Covers role management, tender lifecycle, bidding, voting, finalization, vendor registration, and edge cases.

## Deployment

Frontend is deployed on Vercel (connected to the GitHub repository). The smart contract is deployed on Polygon Amoy via Remix IDE.

## Tech Stack

- React 19, Tailwind CSS, lucide-react
- ethers.js v5 (loaded via CDN in `public/index.html`)
- Solidity 0.8.19, Hardhat
- Polygon Amoy testnet
- Pinata (IPFS)
- Vercel (hosting)
