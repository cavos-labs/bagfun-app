<div align="center">
  <img src="public/bag-fun.png" alt="BagFun Logo" width="200" height="auto">
</div>

# BagFun App - Memecoin Trading Frontend

BagFun App is the primary frontend application for the BagFun memecoin trading platform on Starknet. It provides a comprehensive user interface for token trading, wallet management, portfolio tracking, and memecoin creation.

## 🏗️ Application Architecture

### Technology Stack
- **Next.js 15** with App Router and Turbopack
- **React 19** with Server Components
- **TypeScript 5** for type safety
- **Tailwind CSS 4** for styling
- **Jotai 2.13** for state management

### Blockchain Integration
- **Starknet.js 7.6.4** - Core blockchain interaction
- **@starknet-io/get-starknet 4.0.7** - Wallet connection
- **@avnu/avnu-sdk 3.1.1** - DEX aggregator for swaps
- **Cavos Service SDK 1.2.35** - Authentication & managed transactions

### Additional Libraries
- **Axios 1.11** - HTTP client
- **@uniswap/sdk-core 7.7** - Trading calculations

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Starknet wallet (Argent X, Braavos, etc.)
- Access to Starknet RPC endpoint
- Cavos account (optional)

### Installation & Setup

1. **Install dependencies**
```bash
npm install
```

2. **Environment Configuration**

Copy `.env.example` to `.env.local` and configure:

```env
# Cavos Configuration (Required for enhanced features)
CAVOS_ORG_SECRET=your-cavos-org-secret
CAVOS_APP_ID=your-cavos-app-id
NEXT_PUBLIC_CAVOS_APP_ID=your-cavos-app-id

# Starknet Configuration
NEXT_PUBLIC_STARKNET_NETWORK=mainnet  # or sepolia
NEXT_PUBLIC_RPC=your-starknet-rpc-endpoint

# Backend API Configuration  
BAGFUN_WEB_API_URL=http://localhost:3000
BAGFUN_WEB_API_KEY=your-api-key
```

3. **Development Server**
```bash
npm run dev
```

4. **Production Build**
```bash
npm run build
npm start
```

## 📁 Project Structure

```
bagfun-app/
├── app/                           # Next.js App Router
│   ├── api/                       # API Routes
│   │   ├── v1/auth/              # Authentication endpoints
│   │   │   ├── signUp/route.ts   # User registration
│   │   │   └── signIn/route.ts   # User login
│   │   ├── tokens/               # Token management
│   │   │   ├── route.ts          # List tokens
│   │   │   ├── create/route.ts   # Create token
│   │   │   └── [id]/route.ts     # Get token details
│   │   ├── quotes/route.ts       # Trading quotes
│   │   ├── profile/route.ts      # User profile
│   │   └── voyager/[txHash]/route.ts # Transaction details
│   ├── token/[address]/          # Dynamic token pages
│   │   └── page.tsx              # Token detail & trading
│   ├── profile/                  # User profile
│   │   └── page.tsx              # Profile management
│   ├── auth/callback/            # OAuth callback
│   │   └── page.tsx              # Auth callback handler
│   ├── abis/                     # Smart contract ABIs
│   │   ├── ERC20.ts              # ERC-20 interface
│   │   ├── AVNU.ts               # DEX router
│   │   ├── MemecoinFactory.ts    # Token factory
│   │   └── STRK.ts               # STRK token
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles
├── components/                   # Reusable UI components
│   ├── AccessProvider.tsx        # Authentication guard
│   ├── CreateTokenModal.tsx      # Token creation modal
│   ├── DepositModal.tsx          # Deposit funds modal
│   ├── InvitationGate.tsx        # Beta access gate
│   ├── LineChart.tsx             # Price chart component
│   ├── LoginModal.tsx            # Authentication modal
│   ├── SearchBar.tsx             # Token search
│   ├── Sidebar.tsx               # Navigation sidebar
│   ├── TokenBalancesModal.tsx    # Portfolio modal
│   ├── TokenCard.tsx             # Token display card
│   └── WithdrawModal.tsx         # Withdraw funds modal
├── lib/                          # Core services & utilities
│   ├── auth-atoms.ts             # Authentication state
│   ├── wallet-atoms.ts           # Wallet connection state
│   ├── useWalletConnector.ts     # Wallet connection hook
│   ├── auth.ts                   # Auth service
│   ├── tokenService.ts           # Token API service
│   ├── swapService.ts            # Trading service
│   ├── quotesService.ts          # Price quotes service
│   ├── profileService.ts         # User profile service
│   ├── chartService.ts           # Chart data service
│   ├── utils.ts                  # Helper utilities
│   └── mockData.ts               # Development data
├── types/                        # TypeScript definitions
│   └── starknet.d.ts             # Starknet types
├── public/                       # Static assets
│   ├── fonts/                    # Custom fonts
│   └── images/                   # UI images
└── package.json                  # Dependencies & scripts
```

## 🎯 Core Features

### 🔐 Authentication System
**Dual Authentication Support:**
- **Cavos Authentication**: Email/password with managed wallets
- **Direct Wallet Connection**: Connect existing Starknet wallets

### 💱 Trading Engine
**DEX Integration:**
- AVNU aggregator for optimal swap routes
- Real-time price quotes and market data
- Support for both wallet types (managed/direct)

**Trading Flow:**
1. Connect wallet or authenticate with Cavos
2. Select trading pair from available tokens
3. Get real-time quotes with slippage calculation
4. Execute swap through appropriate method
5. Confirm transaction and update balances

**Key Components:**
- `token/[address]/page.tsx` - Trading interface
- `swapService.ts` - Swap execution logic
- `quotesService.ts` - Price quote management

### 🎨 Token Management
**Token Creation:**
- Deploy new ERC-20 tokens to Starknet
- Upload token images to IPFS
- Set token metadata (name, symbol, description)
- Configure initial supply and distribution

**Token Discovery:**
- Browse all available tokens
- Search by name or symbol
- View token details and trading data
- Track price history with charts

**Key Components:**
- `CreateTokenModal.tsx` - Token creation interface
- `TokenCard.tsx` - Token display component
- `tokenService.ts` - Token API interactions

### 📊 Portfolio Management
**Balance Tracking:**
- Real-time balance updates for all tokens
- Portfolio value calculation
- Transaction history
- Performance analytics

**Key Components:**
- `TokenBalancesModal.tsx` - Portfolio overview
- `profile/page.tsx` - User profile & settings
- Balance hooks in service files

## 🔧 State Management


**Bagfun Web API:**
- Token metadata and storage
- User profile management
- IPFS asset management

## 🎨 Design System

### Typography
- **Heading Font**: Rama Gothic Bold (custom font)
- **Body Font**: System fonts (Inter fallback)

### Color Palette
- **Primary Background**: `#141414` (Dark theme)
- **Card Backgrounds**: `#1a1a1a` (Dark gray)
- **Text Colors**:
  - Primary: `#ffffff` (White)
  - Secondary: `#a1a1aa` (Gray)
- **Accent Colors**:
  - Success: `#10b981` (Green)
  - Warning: `#ef4444` (Red)
  - Primary: Blue gradient

### Component Patterns

**Modal System:**
- Consistent modal wrapper with backdrop
- Smooth animations and transitions
- Mobile-responsive design
- Focus management and accessibility

**Card Layouts:**
- Token display cards with hover effects
- Portfolio balance cards
- Trading interface cards

## 🔒 Security Implementation

### Wallet Security
- **No Private Key Storage**: All private keys remain in user wallets
- **External Signing**: Transactions signed through wallet interfaces  
- **Session Management**: Secure token-based authentication
- **Auto-logout**: Automatic session cleanup

### API Security
- **Environment Variables**: Sensitive keys in server environment
- **Input Validation**: All user inputs validated and sanitized
- **CORS Configuration**: Proper origin restrictions
- **Error Handling**: No sensitive data in error responses

### Smart Contract Security
- **ABI Validation**: Contract interactions through validated ABIs
- **Transaction Limits**: Built-in slippage and amount limits
- **Network Verification**: Chain ID validation for all transactions

## 🔄 Data Flow Patterns

### Trading Flow
```
User Action → State Update → API Call → Blockchain Interaction → State Update → UI Update
```

1. User initiates trade action
2. Update loading state in UI
3. Fetch quote from AVNU API
4. Display quote to user for confirmation
5. Execute transaction through wallet/Cavos
6. Monitor transaction status
7. Update balances and UI state

### Authentication Flow
```
Login Attempt → Validation → API Call → State Update → Route Protection → UI Update
```

1. User submits credentials
2. Client-side validation
3. API authentication request
4. Update authentication atoms
5. Enable protected routes
6. Redirect to requested page

### Balance Updates
```
Connection → Initial Fetch → Periodic Updates → Transaction Events → Real-time Sync
```

1. Wallet connection established
2. Fetch all token balances
3. Set up periodic refresh intervals
4. Listen for transaction confirmations
5. Update balances immediately after transactions

## 🛠️ Development Guidelines

### Code Standards
- **TypeScript Strict Mode**: All code fully typed
- **Component Structure**: Functional components with hooks
- **Error Boundaries**: Comprehensive error handling
- **Performance**: Optimized re-renders with proper dependencies

### Build Optimization
- **Turbopack**: Fast development builds
- **Code Splitting**: Automatic route-based splitting
- **Asset Optimization**: Image and font optimization
- **Bundle Analysis**: Regular bundle size monitoring

## 🌍 Environment Configuration

### Network Support
- **Starknet Mainnet**: Production environment
- **Local Development**: Integration with local bagfun-web

### RPC Configuration
Configure Starknet RPC endpoints for optimal performance:
```env
# Alchemy (Recommended)
NEXT_PUBLIC_RPC=https://starknet-mainnet.g.alchemy.com/starknet/version/rpc/v0_8/YOUR_KEY

# Infura
NEXT_PUBLIC_RPC=https://starknet-mainnet.infura.io/v3/YOUR_KEY

# Public RPC (Rate Limited)
NEXT_PUBLIC_RPC=https://starknet-mainnet.public.blastapi.io/rpc/v0_8
```

## 📱 Mobile Responsiveness

### Responsive Design
- **Mobile-First**: Design starts with mobile experience
- **Progressive Enhancement**: Desktop features added progressively
- **Touch Interactions**: Optimized for touch interfaces
- **Performance**: Optimized for mobile networks

### Key Breakpoints
- **sm**: 640px - Mobile landscape
- **md**: 768px - Tablet portrait
- **lg**: 1024px - Desktop
- **xl**: 1280px - Large desktop

## 🔧 Development Scripts

```bash
# Development
npm run dev          # Start development server with Turbopack

# Production  
npm run build        # Build production bundle with Turbopack
npm start            # Start production server

# Development Tools
npm run type-check   # TypeScript type checking
npm run lint         # ESLint code linting
npm run format       # Prettier code formatting
```

## 🚨 Troubleshooting

### Common Issues

**Wallet Connection:**
- Clear localStorage wallet state
- Check wallet extension is unlocked
- Verify network matches configuration
- Restart wallet extension if needed

**Balance Loading:**
- Check RPC endpoint is accessible
- Verify contract addresses are correct
- Check for network connectivity issues
- Review token contract compatibility

**Trading Issues:**
- Verify sufficient token balance
- Check token allowances
- Confirm slippage settings
- Validate token contract addresses

### Debug Mode
Enable detailed logging:
```env
NODE_ENV=development
NEXT_PUBLIC_DEBUG=true
```

## 📈 Performance Optimization

### Core Web Vitals
- **LCP**: Optimized with Next.js Image component
- **FID**: Minimized JavaScript execution time
- **CLS**: Stable layouts with proper sizing

### Optimization Strategies
- **Route-based Code Splitting**: Automatic with Next.js App Router
- **Image Optimization**: Next.js Image component with WebP
- **Font Optimization**: Self-hosted fonts with display: swap
- **Bundle Analysis**: Regular monitoring with webpack-bundle-analyzer

## 🤝 Contributing

### Development Workflow
1. Fork and clone the repository
2. Install dependencies with `npm install`
3. Create feature branch from `main`
4. Make changes with appropriate tests
5. Run linting and type checking
6. Submit pull request with description

### Code Style
- Follow existing TypeScript and React patterns
- Use functional components with hooks
- Implement proper error boundaries
- Add JSDoc comments for complex functions
- Follow Tailwind CSS utility patterns

## 📄 License

This project is proprietary software. All rights reserved.

---

**BagFun App** - Memecoins Everywhere