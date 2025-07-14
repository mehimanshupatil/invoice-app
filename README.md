# Invoice Management System

A modern invoice management system with role-based access control and multi-environment support.

## Features

- 🔐 Role-based authentication (Admin, Accountant, Viewer)
- 🗄️ MySQL database integration with user management
- 📊 Dashboard with analytics and statistics
- 📄 Invoice creation and management
- 🎨 Modern UI with Tailwind CSS and shadcn/ui
- 🌍 Multi-environment support (Development, Staging, Production)
- 📱 Responsive design
- 🔍 Advanced filtering and search

## Environments

### Development
```bash
npm run dev
```

### Staging
```bash
npm run dev:staging
npm run build:staging
npm run start:staging
```

### Production
```bash
npm run build:production
npm run start:production
```

## Environment Variables

Copy the appropriate environment file:
- `.env.local` - Development
- `.env.staging` - Staging
- `.env.production` - Production

## Database Setup

### MySQL Configuration

1. Install MySQL and create a database
2. Update the database configuration in your environment files:
   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=invoice_manager
   ```
3. Visit `/users` page (Admin only) to initialize the database
4. The system will automatically create tables and default users

### API Endpoints

- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `GET /api/users/[id]` - Get specific user
- `PUT /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Delete user
- `GET /api/database/init` - Check database connection
- `POST /api/database/init` - Initialize database tables

## Docker Deployment

### Staging
```bash
docker-compose -f docker/docker-compose.staging.yml up -d
```

### Production
```bash
docker-compose -f docker/docker-compose.production.yml up -d
```

## Demo Accounts

- **Admin**: admin@company.com
- **Accountant**: accountant@company.com  
- **Viewer**: viewer@company.com
- **Password**: password123

## Tech Stack

- Next.js 13
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod validation
- Lucide React icons
