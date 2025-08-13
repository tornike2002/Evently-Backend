# Evently Backend

A comprehensive event management and ticketing system backend built with Node.js, Express, TypeScript, and MongoDB. This API provides complete functionality for event creation, user authentication, shopping cart management, ticket purchasing with Stripe payments, and PDF ticket generation.

## Features

### Authentication & Authorization
- User registration and login with JWT tokens
- Role-based access control (User, Organizer, Admin)
- Secure cookie-based authentication
- Refresh token mechanism
- Password hashing with bcryptjs

### Event Management
- Create, read, update, and delete events (CRUD)
- Role-based permissions for event management
- Event details including title, description, date, location, pricing
- Seat availability tracking
- Image support for events

### Shopping Cart
- Add/remove events to/from cart
- Update cart quantities
- User-specific cart management
- Persistent cart storage

### Ticket System
- Secure ticket purchasing with Stripe integration
- Unique ticket code generation
- Payment status tracking
- PDF ticket generation with QR codes
- Transaction management with MongoDB sessions
- Support for 3D Secure authentication

### Additional Features
- Comprehensive API documentation with Swagger
- Input validation with Zod schemas
- Error handling middleware
- CORS support
- Environment-based configuration

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT)
- **Payments**: Stripe API
- **PDF Generation**: PDFKit
- **QR Codes**: qrcode library
- **Validation**: Zod
- **Documentation**: Swagger UI
- **Development**: ts-node-dev for hot reloading

## Prerequisites

Before running this project, make sure you have:

- **Node.js** (v16 or higher)
- **MongoDB** (local installation or MongoDB Atlas)
- **Stripe Account** (for payment processing)
- **npm** or **yarn** package manager

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd evently-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   
   Create a `.env` file in the root directory with the following variables:
   
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Database
   MONGO_URL=mongodb://localhost:27017/evently
   # OR for MongoDB Atlas:
   # MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/evently
   
   # JWT Secrets (generate strong random strings)
   ACCESS_TOKEN_SECRET=your-super-secret-access-token-key
   REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key
   
   # Stripe Configuration
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   
   # Frontend URL (for CORS and redirects)
   FRONTEND_URL=http://localhost:3000
   ```

   **Security Note**: Never commit your `.env` file to version control. Use strong, unique secrets for production.

4. **Start the development server**
   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:5000` (or your specified PORT)

## Project Structure

```
evently-backend/
├── src/
│   ├── config/
│   │   ├── db.ts              # MongoDB connection
│   │   └── swagger.ts         # Swagger configuration
│   ├── controllers/
│   │   ├── auth.ts            # Authentication logic
│   │   ├── cart.ts            # Shopping cart operations
│   │   ├── events.ts          # Event management
│   │   └── ticket.ts          # Ticket purchasing & PDF generation
│   ├── middlewares/
│   │   ├── requireLogin.ts    # Authentication middleware
│   │   ├── RequireRole.ts     # Authorization middleware
│   │   └── validate.ts        # Input validation middleware
│   ├── models/
│   │   ├── User.ts            # User schema
│   │   ├── Events.ts          # Event schema
│   │   ├── Cart.ts            # Cart schema
│   │   └── Ticket.ts          # Ticket schema
│   ├── routes/
│   │   ├── auth.ts            # Authentication routes
│   │   ├── events.ts          # Event routes
│   │   ├── cart.ts            # Cart routes
│   │   └── ticket.ts          # Ticket routes
│   ├── services/
│   │   └── pdfService.ts      # PDF generation service
│   ├── utils/
│   │   └── jwt.ts             # JWT utilities
│   ├── validators/
│   │   ├── user.ts            # User validation schemas
│   │   ├── events.ts          # Event validation schemas
│   │   ├── cart.ts            # Cart validation schemas
│   │   └── ticket.ts          # Ticket validation schemas
│   ├── types/
│   │   └── express/index.d.ts # Express type extensions
│   ├── index.ts               # Application entry point
│   └── server.ts              # Express server configuration
├── package.json
├── tsconfig.json
└── README.md
```

## API Documentation

Once the server is running, you can access the interactive API documentation at:

**Swagger UI**: `http://localhost:5000/api-docs`

### Main API Endpoints

#### Authentication (`/api/auth`)
- `POST /register` - Register a new user
- `POST /login` - User login
- `POST /logout` - User logout
- `POST /refresh-token` - Refresh access token
- `GET /me` - Get current user profile

#### Events (`/api/events`)
- `GET /` - Get all events
- `GET /:id` - Get event by ID
- `POST /` - Create new event (Organizer/Admin only)
- `PUT /:id` - Update event (Organizer/Admin only)
- `DELETE /:id` - Delete event (Organizer/Admin only)

#### Cart (`/api/cart`)
- `GET /` - Get user's cart
- `POST /` - Add item to cart
- `PUT /:id` - Update cart item
- `DELETE /:id` - Remove item from cart

#### Tickets (`/api/tickets`)
- `POST /purchase` - Purchase tickets
- `POST /confirm-payment` - Confirm payment after 3D Secure
- `GET /my-tickets` - Get user's tickets
- `GET /:id/pdf` - Download ticket as PDF

## User Roles

The system supports three user roles:

1. **User** (default) - Can browse events, manage cart, purchase tickets
2. **Organizer** - Can create and manage their own events
3. **Admin** - Full access to all events and system features

## Payment Integration

The system integrates with Stripe for secure payment processing:

- Supports various payment methods
- Handles 3D Secure authentication
- Transaction atomicity with MongoDB sessions
- Automatic seat availability updates
- Payment status tracking

## Ticket Features

- **Unique Ticket Codes**: Each ticket gets a unique code (format: `TK-{timestamp}-{random}`)
- **PDF Generation**: Downloadable PDF tickets with QR codes
- **Event Details**: Tickets include event information and purchase details
- **Security**: Only ticket owners can download their tickets

## Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=5000
MONGO_URL=your-production-mongodb-url
ACCESS_TOKEN_SECRET=your-production-access-secret
REFRESH_TOKEN_SECRET=your-production-refresh-secret
STRIPE_SECRET_KEY=sk_live_your_live_stripe_key
FRONTEND_URL=https://your-frontend-domain.com
```

### Build for Production

```bash
# Build TypeScript to JavaScript
npm run build

# Start production server (after build)
npm start
```

### Deployment Platforms

This application can be deployed on:
- **Heroku**
- **Railway**
- **DigitalOcean App Platform**
- **AWS EC2**
- **Google Cloud Platform**
- **Vercel** (with serverless functions)

## Development

### Available Scripts

```bash
# Start development server with hot reload
npm run dev

# Build TypeScript to JavaScript
npm run build

# Run tests (if configured)
npm test
```

### Adding New Features

1. Create new route files in `src/routes/`
2. Add corresponding controllers in `src/controllers/`
3. Define data models in `src/models/`
4. Add validation schemas in `src/validators/`
5. Update Swagger documentation with JSDoc comments
6. Test your endpoints using the Swagger UI

## Security Features

- **Password Hashing**: Uses bcryptjs for secure password storage
- **JWT Tokens**: Secure authentication with access and refresh tokens
- **CORS Protection**: Configurable cross-origin resource sharing
- **Input Validation**: Comprehensive request validation with Zod
- **Role-based Access**: Fine-grained permission system
- **Secure Cookies**: HTTP-only cookies for token storage
- **Environment Secrets**: Sensitive data stored in environment variables

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions:

1. Check the API documentation at `/api-docs`
2. Review the environment variable configuration
3. Ensure all required services (MongoDB, Stripe) are properly configured
4. Check the console logs for error details

## Future Enhancements

- [ ] Email notifications for ticket purchases
- [ ] Event analytics and reporting
- [ ] Seat selection system
- [ ] Event categories and filtering
- [ ] Multi-language support
- [ ] Mobile app API extensions
- [ ] Real-time event updates with WebSockets
- [ ] Event review and rating system

---

**Happy Eventing!**
