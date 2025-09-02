# bag.fun App

This is the frontend web application for bag.fun, built with [Next.js](https://nextjs.org). This application serves as the main user interface for the bag.fun platform, providing an interactive experience for discovering, trading, and managing meme coins.

## Project Overview

The bag.fun app is designed as a cryptocurrency trading platform with a focus on meme coins. The interface features:
- **Coin Discovery**: Browse and discover trending meme coins
- **Trading Interface**: Buy and sell coins with real-time market data
- **Portfolio Management**: Track holdings and performance
- **User Authentication**: Secure sign-in and profile management
- **Responsive Design**: Optimized for both desktop and mobile experiences

## Project Structure

### Design System

#### Typography
- **Title/Heading Font**: Rama Gothic Bold (custom font, consistent with bag.fun branding)
- **Body/Content Font**: Inter (system font)

#### Color Scheme
- **Primary Background**: Dark theme (`#141414`)
- **Card Backgrounds**: Dark gray (`#1a1a1a`)
- **Text Colors**: 
  - Primary: White (`#ffffff`)
  - Secondary: Gray (`#a1a1aa`)
- **Accent Colors**:
  - Success/Up: Green (`#10b981`)
  - Warning/Down: Red (`#ef4444`)
  - Primary Action: Blue accent

#### Components
- **Coin Cards**: Display coin information with image, name, ticker, address, and market cap
- **Navigation**: Left sidebar with Home, Profile sections
- **Search**: Global search functionality with keyboard shortcut (⌘ + K)
- **Authentication**: Sign in/out functionality

### Tech Stack
- **Framework**: Next.js 15.5.2 with App Router
- **Runtime**: React 19.1.0
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript
- **Build Tool**: Turbopack (enabled for faster builds)
- **State Management**: React Context/Hooks (or specify if using Redux, Zustand, etc.)

## Environment Setup

### API Configuration

This app consumes APIs from the bag.fun backend service. You'll need to configure the API endpoints:

1. Copy the environment template:
   ```bash
   cp .env.example .env.local
   ```

2. Update `.env.local` with your API configuration:
   ```env
   NEXT_PUBLIC_API_URL=your_backend_api_url
   NEXT_PUBLIC_WS_URL=your_websocket_url
   ```

### Required Assets

Ensure the following assets are available in the `public/` directory:
- `bag-fun.png` - Main BagFun logo/branding
- `create-coin.png` - Create coin button image
- `fonts/ramagothicbold.ttf` - Custom Rama Gothic Bold font

## Getting Started

### Development Server

First, install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

### Build for Production

To create an optimized production build:

```bash
npm run build
# or
yarn build
# or
pnpm build
```

### Start Production Server

To start the production server:

```bash
npm run start
# or
yarn start
# or
pnpm start
```

## Features

### Core Functionality
- **Real-time Coin Data**: Live market cap updates and price movements
- **Coin Discovery**: Browse trending and popular meme coins
- **Search**: Find specific coins by name or ticker
- **User Profiles**: Personalized user experience
- **Responsive UI**: Works seamlessly on desktop and mobile

### User Interface
- **Dark Theme**: Consistent with bag.fun branding
- **Card-based Layout**: Clean, modern interface for coin display
- **Interactive Elements**: Hover states, loading states, and smooth animations
- **Accessibility**: Keyboard navigation and screen reader support

## API Integration

The app integrates with the bag.fun backend API for:
- Coin data and market information
- User authentication and profiles
- Real-time price updates via WebSocket
- Trading functionality

## Development Guidelines

### Code Style
- Follow TypeScript best practices
- Use functional components with React Hooks
- Implement proper error handling and loading states
- Follow the existing component structure and naming conventions

### Component Structure
- Keep components small and focused
- Use proper TypeScript interfaces for props
- Implement proper error boundaries
- Follow the established design system

### Performance
- Optimize images and assets
- Implement proper caching strategies
- Use React.memo for expensive components
- Implement virtual scrolling for large lists

## Deployment

### Vercel (Recommended)
The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

### Environment Variables
Make sure to set the following environment variables in your deployment:
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_WS_URL`

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [React Documentation](https://react.dev) - learn React concepts and patterns
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - utility-first CSS framework
- [TypeScript Documentation](https://www.typescriptlang.org/docs) - typed JavaScript

## Contributing

When contributing to this project:
1. Follow the established code style and conventions
2. Maintain consistency with the bag.fun design system
3. Test your changes thoroughly
4. Update documentation as needed

## License

This project is part of the bag.fun platform. Please refer to the main project license for usage terms.