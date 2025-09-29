# Rural Marketplace Platform

A comprehensive full-stack platform connecting rural farmers, artisans, and small producers with customers worldwide. This marketplace enables direct sales of fresh food, handmade crafts, and local art while supporting multilingual interactions.

## 🌟 Features

### For Sellers (Farmers & Artisans)
- Easy product listing and management
- Inventory tracking
- Order notifications and management
- Direct customer communication
- Fair pricing without middlemen
- Multilingual product descriptions

### For Customers
- Browse authentic rural products
- Direct purchases from producers
- Secure payment processing
- Order tracking
- Multilingual interface support
- Reviews and ratings system

### Platform Features
- Responsive design for all devices
- Multi-language support (i18next)
- Role-based authentication (JWT)
- Real-time order updates
- Category-based product organization
- Search and filter functionality

## 🛠️ Technology Stack

### Frontend
- **React.js** - Modern UI framework
- **CSS3** - Styling with Flexbox/Grid
- **i18next** - Internationalization
- **Axios** - API communication

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **multer** - File upload handling

## 📁 Project Structure

```
ecommerce_Artisans/
├── client/                 # React frontend application
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service calls
│   │   ├── utils/         # Helper functions
│   │   ├── locales/       # Translation files
│   │   └── styles/        # CSS files
│   └── package.json
├── server/                # Express.js backend
│   ├── controllers/       # Route controllers
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── config/           # Configuration files
│   ├── uploads/          # File uploads directory
│   └── package.json
├── shared/               # Shared utilities and types
├── docs/                 # Documentation
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ecommerce_Artisans
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Environment Setup**
   
   Create `.env` file in the server directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/rural_marketplace
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=7d
   ```

5. **Start the application**
   
   Start the backend server:
   ```bash
   cd server
   npm run dev
   ```
   
   Start the frontend (in a new terminal):
   ```bash
   cd client
   npm start
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📱 Usage

### For New Users
1. Register as either a Seller or Customer
2. Complete your profile with relevant information
3. Verify your email address

### For Sellers
1. Add your products with descriptions and images
2. Set pricing and inventory levels
3. Manage orders and communicate with customers
4. Track your sales and revenue

### For Customers
1. Browse products by category
2. Use search and filters to find specific items
3. Add items to cart and proceed to checkout
4. Track your orders and leave reviews

## 🌐 Supported Languages

The platform currently supports:
- English (default)
- Spanish
- French
- Hindi
- Mandarin

Additional languages can be easily added through the i18next configuration.

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Protected API routes
- File upload security measures
- Environment variable protection

## 🤝 Contributing

We welcome contributions from the community! Please read our contributing guidelines and submit pull requests for any improvements.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation in the `/docs` folder

## 🎯 Future Enhancements

- Mobile app development
- Payment gateway integration
- Advanced analytics dashboard
- AI-powered product recommendations
- Blockchain integration for supply chain transparency
- Video product demonstrations
- Community forums and messaging system

---

Built with ❤️ for rural communities worldwide