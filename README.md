# NEXORA - Generic CRM and PIM Platform

A full-stack SaaS application for resource management, data orchestration, and third-party integrations. NEXORA enables businesses to define custom resource schemas, manage records, configure workflows, and connect external services like WooCommerce.

![NEXORA](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![React](https://img.shields.io/badge/React-18+-61DAFB.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-6+-47A248.svg)

---

## 📺 Video Walkthrough & Demo

[![Watch Project Demo Video](https://img.shields.io/badge/▶%EF%B8%8F_Watch_Demo_Video-Google_Drive-4285F4?style=for-the-badge&logo=googledrive&logoColor=white)](https://drive.google.com/file/d/1L3pk0fHz-vYoWhy0ZV-gYLB2PjrnFXaZ/view?usp=share_link)

🎥 **Direct Video Link:** [https://drive.google.com/file/d/1L3pk0fHz-vYoWhy0ZV-gYLB2PjrnFXaZ/view?usp=share_link](https://drive.google.com/file/d/1L3pk0fHz-vYoWhy0ZV-gYLB2PjrnFXaZ/view?usp=share_link)

---

## 🚀 Features

### Core Functionality
- **Products & Catalog Management**: Visual card gallery & enterprise table views with high-res photography, SKU tracking, stock level health bars, category filtering, and quick-inspection modal
- **Customer CRM Directory**: Customer 360° profiles with verified avatars, country flags, company roles, gross lifetime spend (LTV), order frequency, and VIP tier segmentation
- **Interactive Data Analytics & Simulation**: Zero-dependency pure SVG bar charts, live metric toggles (Revenue, Orders, Customers), live forecast growth multiplier slider (-50% to +100%), and dynamic user data injection form
- **Dynamic Resource Builder**: Create custom resource schemas with fields, validation rules, and workflows
- **Generic Record Management**: CRUD operations for any resource type with search, filtering, and pagination
- **Workflow Automation**: Configure lifecycle states and transitions for records
- **Executive Dashboard**: Real-time unified metrics for catalog inventory, customer revenue, sync health, and integrations

### Integrations
- **WooCommerce Integration**: Sync products, customers, and orders
- **Dynamic Resource Mapping**: Map external WooCommerce resources to any NEXORA resource
- **Field-to-Field Mapping**: Customize how external data maps to your schemas
- **Sync Monitoring**: Track sync operations, errors, and success rates
- **Mock Mode**: Test integrations with realistic simulated data

### AI Agent
- **Rule-Based Analytics**: Query your data with natural language
- **Low Stock Detection**: Find products below stock thresholds
- **Missing Field Analysis**: Identify incomplete records
- **Failed Sync Troubleshooting**: Analyze integration errors
- **Resource Summaries**: Get insights and improvement recommendations

### Authentication
- **Secure Login/Signup**: JWT-based authentication
- **Protected Routes**: Role-based access control
- **Session Persistence**: Secure token management
- **Public Landing Page**: Professional marketing interface

## 🛠 Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client
- **Lucide React** - Icon library

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **nodemon** - Development server auto-reload

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **morgan** - HTTP request logger

## 📦 Installation

### Prerequisites
- Node.js 18 or higher
- MongoDB 6 or higher
- npm or yarn

### Clone the Repository
```bash
git clone https://github.com/jiya-haldankar77/Nexora-generic-CRM-and-PIM.git
cd Nexora-generic-CRM-and-PIM
```

### Environment Configuration

Create a `.env` file in the `server` directory:

```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/nexora
NODE_ENV=development
MOCK_MODE=true
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### Install Dependencies

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### Start MongoDB

```bash
# macOS (using Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

## 🏃 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```
Backend runs on `http://localhost:5001`

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```
Frontend runs on `http://localhost:3000`

### Production Build

```bash
# Build frontend
cd client
npm run build

# Start backend in production mode
cd ../server
NODE_ENV=production npm start
```

## 📖 Usage

### First Steps

1. **Access the Application**
   - Open http://localhost:3000
   - Click "Get Started Free" to create an account
   - Or use the login page with your credentials

2. **Create a Resource**
   - Navigate to Resources → Resource Builder
   - Define resource name and description
   - Add fields (text, number, select, boolean, etc.)
   - Configure validation rules
   - Save the resource schema

3. **Manage Records**
   - Go to Resources → [Your Resource] → Records
   - Click "New Record" to add data
   - Use search and filters to find records
   - Edit or delete records as needed

4. **Set Up Integrations**
   - Navigate to Integrations
   - Add a WooCommerce integration
   - Configure resource mappings
   - Test the connection
   - Click "Sync Now" to import data

5. **Use AI Agent**
   - Go to AI Agent in the sidebar
   - Ask questions like:
     - "Find products with stock below 10"
     - "Check failed integration syncs"
     - "Summarize the product resource"

## 🔌 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Resource Endpoints

#### Get All Resources
```http
GET /api/resources
Authorization: Bearer <token>
```

#### Create Resource
```http
POST /api/resources
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "product",
  "label": "Product",
  "fields": [...]
}
```

#### Get Resource by Name
```http
GET /api/resources/:name
Authorization: Bearer <token>
```

### Record Endpoints

#### Get Records
```http
GET /api/records/:resourceType?page=1&limit=10&search=query
Authorization: Bearer <token>
```

#### Create Record
```http
POST /api/records/:resourceType
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Product Name",
  "sku": "SKU-001",
  "price": 99.99
}
```

#### Update Record
```http
PUT /api/records/:resourceType/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "price": 89.99
}
```

#### Delete Record
```http
DELETE /api/records/:resourceType/:id
Authorization: Bearer <token>
```

### Integration Endpoints

#### Get Integrations
```http
GET /api/integrations
Authorization: Bearer <token>
```

#### Create Integration
```http
POST /api/integrations
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "WooCommerce Store",
  "type": "woocommerce",
  "config": {
    "url": "https://your-store.com",
    "consumerKey": "ck_xxx",
    "consumerSecret": "cs_xxx"
  },
  "resourceMappings": [...]
}
```

#### Sync Integration
```http
POST /api/integrations/:id/sync
Authorization: Bearer <token>
```

#### Test Connection
```http
POST /api/integrations/:id/test
Authorization: Bearer <token>
```

### AI Agent Endpoints

#### Analyze Query
```http
POST /api/ai-agent/analyze
Authorization: Bearer <token>
Content-Type: application/json

{
  "query": "Find products with stock below 10"
}
```

#### Execute Query
```http
POST /api/ai-agent/execute
Authorization: Bearer <token>
Content-Type: application/json

{
  "rule": "low_stock",
  "threshold": 10
}
```

## 🧪 Testing

### Run Tests (if configured)
```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test
```

### Manual Testing Checklist

- [ ] User registration and login
- [ ] Resource creation and editing
- [ ] Record CRUD operations
- [ ] Search and filtering
- [ ] WooCommerce integration sync
- [ ] AI Agent queries
- [ ] Session persistence after refresh
- [ ] Protected route enforcement

## 🔐 Security

- Passwords are hashed using bcryptjs
- JWT tokens for authentication
- Protected routes require valid tokens
- Environment variables for sensitive data
- CORS configuration for API access
- Input validation on all endpoints

## 📊 Database Schema

### ResourceDefinition
```javascript
{
  name: String,          // Resource identifier
  label: String,         // Display name
  icon: String,          // Icon identifier
  description: String,   // Resource description
  fields: [{             // Field definitions
    key: String,
    label: String,
    type: String,
    required: Boolean,
    validation: Object
  }],
  workflow: {            // Workflow configuration
    enabled: Boolean,
    statusField: String,
    statuses: [],
    transitions: []
  },
  settings: {
    defaultSort: String,
    itemsPerPage: Number
  }
}
```

### ResourceRecord
```javascript
{
  resourceType: String,  // Reference to ResourceDefinition
  data: Object,          // Actual record data
  externalId: String,    // External system ID
  syncSource: String,    // Integration source
  syncStatus: String,    // sync status (synced, none, error)
  syncError: String,     // Error message if sync failed
  lastSyncedAt: Date
}
```

### Integration
```javascript
{
  name: String,
  type: String,          // woocommerce, shopify, salesforce
  config: Object,        // Integration credentials
  resourceMappings: [{   // Resource mapping configuration
    resourceType: String,
    externalType: String,
    fieldMappings: Object,
    enabled: Boolean
  }],
  enabled: Boolean,
  lastSync: Date,
  status: String
}
```

### User
```javascript
{
  name: String,
  email: String,         // Unique, normalized
  password: String,     // Hashed
  createdAt: Date,
  updatedAt: Date
}
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style and conventions
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- **Jiya Haldankar** - Initial work

## 🙏 Acknowledgments

- React team for the amazing framework
- MongoDB for the flexible database
- WooCommerce for the integration inspiration
- Lucide for the beautiful icons

## 📞 Support

For support, email support@nexora.com or open an issue in the GitHub repository.

## 🗺 Roadmap

- [ ] Additional integration platforms (Shopify, Salesforce)
- [ ] Advanced workflow automation
- [ ] Real-time collaboration features
- [ ] Advanced analytics and reporting
- [ ] Mobile app development
- [ ] API rate limiting and caching
- [ ] Multi-tenant support

---

**Built with ❤️ for modern businesses**
