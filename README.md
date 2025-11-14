# Warranty Tracker Web

A modern Next.js application for tracking product warranties and managing claims.

## Project Structure

This project follows a feature-based architecture for better maintainability and scalability:

```
warranty-tracker-web/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Home page
│   ├── dashboard/          # Dashboard page
│   ├── login/              # Login page
│   ├── register/           # Registration page
│   ├── products/           # Products management
│   ├── warranties/          # Warranty management
│   └── claims/             # Claims management
├── src/                    # Source code
│   ├── components/
│   │   ├── ui/           # Base UI components (Button, Input, Loader)
│   │   └── layout/       # Layout components (ProtectedRoute)
│   ├── features/            # Feature-based organization
│   │   ├── auth/          # Authentication feature
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   ├── hooks/
│   │   │   ├── context/
│   │   │   └── providers/
│   │   ├── products/       # Products feature
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   └── hooks/
│   │   ├── warranties/      # Warranties feature
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   └── hooks/
│   │   ├── claims/         # Claims feature
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   └── hooks/
│   │   └── dashboard/      # Dashboard feature
│   │       ├── components/
│   │       ├── services/
│   │       ├── types/
│   │       └── hooks/
│   ├── lib/                 # Shared utilities and configurations
│   │   ├── firebase.ts     # Firebase configuration
│   │   ├── api.base.ts     # Base API configuration
│   │   └── api.service.ts  # API services and hooks
│   ├── hooks/               # Global custom hooks
│   ├── utils/               # Utility functions
│   ├── types/               # Global type definitions
│   └── styles/              # Global styles and theme
│       └── theme.ts         # Material-UI theme configuration
├── public/                 # Static assets
├── .prettierrc            # Prettier configuration
├── .prettierignore         # Files to ignore for Prettier
└── package.json
```

## Technology Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Material-UI** - UI component library
- **React Query** - Data fetching and state management
- **Firebase** - Authentication and backend services
- **Tailwind CSS** - Utility-first CSS framework

## Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
npm install
# or
yarn install
```

### Environment Variables

Create a `.env.local` file with your Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Running the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Building for Production

```bash
npm run build
# or
yarn build
```

### Code Formatting

This project uses Prettier for code formatting. The configuration is in `.prettierrc`.

```bash
# Format all files
npm run format

# Check formatting
npm run format:check
```

### Linting

```bash
npm run lint
# or
yarn lint
```

## Project Features

- **User Authentication** - Sign up and sign in functionality
- **Product Management** - Register and manage products
- **Warranty Tracking** - Track warranty periods and expiration dates
- **Claims Management** - Submit and track warranty claims
- **Dashboard** - Overview of all warranties and claims

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.
