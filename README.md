# M8 Monorepo

A modern collaborative platform built with a React + Vite frontend and a Node.js/Express backend, managed as a monorepo. The backend uses PostgreSQL via Prisma ORM and supports real-time features with Socket.IO.

---

## Project Structure

m8/
├── api/ # Backend (Node.js, Express, Prisma, PostgreSQL)
├── web/ # Frontend (React, Vite, Zustand, TailwindCSS)
├── package.json
├── pnpm-workspace.yaml
└── README.md

---

## Packages

### `api/` (Backend)

- **Tech Stack:** Node.js, Express, Prisma, PostgreSQL, Socket.IO, Cloudinary
- **Features:**
  - User authentication (JWT, bcrypt)
  - List and item management (CRUD)
  - Friend system (requests, blocking)
  - Real-time collaboration via Socket.IO
  - File uploads (Cloudinary)
- **Environment:** Configure `.env` (see `.env.example`)

### `web/` (Frontend)

- **Tech Stack:** React, Vite, Zustand, TailwindCSS, React Router, Lucide Icons
- **Features:**
  - Authentication UI (login/signup)
  - List and item management
  - Friend management and invitations
  - Real-time updates
  - Responsive, modern UI

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [pnpm](https://pnpm.io/) (for monorepo management)
- [PostgreSQL](https://www.postgresql.org/) (for backend database)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/m8.git
   cd m8
   ```

2. **Install dependencies:**

   ```bash
   pnpm install
   ```

3. **Setup environment variables:**

   - Copy `.env.example` in `api/` to `.env` and fill in your secrets.

4. **Setup the database:**

   ```bash
   cd api
   npx prisma migrate dev --name init
   npx prisma generate
   ```

5. **Seed the database (optional):**
   ```bash
   node lib/seed/user.seed.js
   ```

---

## Running the Apps

### Start Backend (API)

```bash
cd api
pnpm dev
```

- Runs on [http://localhost:5009](http://localhost:5009) by default.

### Start Frontend (Web)

```bash
cd web
pnpm dev
```

- Runs on [http://localhost:5173](http://localhost:5173) by default.

---

## Scripts

- `pnpm dev` - Start both frontend and backend in development mode.
- `pnpm build` - Build all packages.
- `pnpm clean` - Clean all build artifacts.

---

## Environment Variables

See `/api/.env.example` for required variables:

- `PORT`
- `JWT_SECRET`
- `CN_NAME`, `CN_API_KEY`, `CN_API_SECRET` (Cloudinary)
- `DATABASE_URL`

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Create a new Pull Request

---

## License

This project is licensed under the MIT License.

---

## Acknowledgements

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Express](https://expressjs.com/)
- [Prisma](https://www.prisma.io/)
- [TailwindCSS](https://tailwindcss.com/)
- [Socket.IO](https://socket.io/)

```

```

```

```
