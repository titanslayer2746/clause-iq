# Clause-IQ Backend

Express.js + TypeScript backend for the Clause-IQ contract management system.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

3. Update environment variables in `.env`

4. Run development server:

```bash
npm run dev
```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## API Endpoints

### Health Check

- `GET /health` - Server health status

### Authentication (Coming soon)

- `POST /api/auth/signup` - Create account and organization
- `POST /api/auth/verify-otp` - Verify email OTP
- `POST /api/auth/login` - Login with JWT
- `POST /api/auth/invite` - Invite team member

### Contracts (Coming soon)

- `POST /api/contracts/upload` - Upload contract
- `GET /api/contracts` - List contracts
- `GET /api/contracts/:id` - Get contract details
- `PATCH /api/contracts/:id` - Update contract
- `POST /api/contracts/:id/extract` - Run AI extraction

### Organizations (Coming soon)

- `GET /api/organizations/current` - Get current org
- `PATCH /api/organizations/current` - Update org
- `GET /api/organizations/members` - List members
