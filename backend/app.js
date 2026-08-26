// backend/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

const studentFundRoutes = require('./routes/studentFund.routes');
const departmentRoutes = require('./routes/department.routes');
const branchRoutes = require('./routes/branch.routes');
const semesterRoutes = require('./routes/semester.routes');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Import database connection
const pool = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth.router');
const itemRoutes = require('./routes/items.routes');

// Import middleware

// Initialize express app
const app = express();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Rate-limit authentication endpoints where brute-force protection is needed.
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // Limit each IP to 30 authentication requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false, // Disable for development
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// CORS configuration
const allowedOrigins = [
    process.env.CLIENT_URL,
    'https://management-sysem.vercel.app',
    'http://localhost:5173',
].filter(Boolean);

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Origin is not allowed by CORS'));
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));

// Request logging: method, endpoint, status, and response time.
app.use(morgan('dev'));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routine authenticated API requests are not globally rate limited so that
// filtering, pagination, and student updates are not blocked by page usage.
app.use('/api/auth', authLimiter);

// ============================================
// DATABASE CONNECTION MIDDLEWARE
// ============================================
// Middleware to check database connection
app.use(async (req, res, next) => {
    try {
        // Skip database check for health endpoints
        if (req.path === '/health' || req.path === '/') {
            return next();
        }
        
        // Check if database is connected
        const client = await pool.connect();
        client.release();
        next();
    } catch (error) {
        console.error('Database connection error:', error);
        res.status(503).json({
            success: false,
            message: 'Database service unavailable. Please try again later.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// ============================================
// HEALTH CHECK ENDPOINTS
// ============================================

// Simple health check
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        status: 'OK',
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Detailed health check with database status
app.get('/health/detailed', async (req, res) => {
    try {
        // Check database connection
        const client = await pool.connect();
        const dbVersion = await client.query('SELECT version()');
        client.release();

        res.status(200).json({
            success: true,
            status: 'OK',
            server: {
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                node_version: process.version,
                environment: process.env.NODE_ENV || 'development'
            },
            database: {
                connected: true,
                version: dbVersion.rows[0].version,
                connection: 'configured DATABASE_URL'
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(503).json({
            success: false,
            status: 'ERROR',
            message: 'Database connection failed',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            timestamp: new Date().toISOString()
        });
    }
});

// Welcome endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to Party Fund Manager API',
        version: '1.0.0',
        endpoints: {
            auth: {
                register: 'POST /api/auth/register',
                login: 'POST /api/auth/login',
                refresh: 'POST /api/auth/refresh-token',
                profile: 'GET /api/auth/profile',
                logout: 'POST /api/auth/logout'
            },
            items: {
                list: 'GET /api/items',
                create: 'POST /api/items',
                update: 'PUT /api/items/:id',
                delete: 'DELETE /api/items/:id'
            },
            income: {
                list: 'GET /api/income',
                create: 'POST /api/income',
                update: 'PUT /api/income/:id',
                delete: 'DELETE /api/income/:id'
            },
            expenses: {
                list: 'GET /api/expenses',
                create: 'POST /api/expenses',
                update: 'PUT /api/expenses/:id',
                delete: 'DELETE /api/expenses/:id'
            },
            budget: {
                get: 'GET /api/budget',
                create: 'POST /api/budget',
                update: 'PUT /api/budget/:id'
            },
            reports: {
                get: 'GET /api/reports',
                export: 'GET /api/reports/export'
            },
            dashboard: {
                summary: 'GET /api/dashboard/summary',
                transactions: 'GET /api/dashboard/recent-transactions',
                charts: 'GET /api/dashboard/charts'
            }
        },
        documentation: '/api-docs',
        health: {
            basic: 'GET /health',
            detailed: 'GET /health/detailed'
        }
    });
});

// ============================================
// API ROUTES
// ============================================

// Auth routes (public)
app.use('/api/auth', authRoutes);

// Protected routes (require authentication)
app.use('/api/items', itemRoutes);

app.use('/api/student-funds', studentFundRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/semesters', semesterRoutes);

// ============================================
// 404 HANDLER
// ============================================
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
        timestamp: new Date().toISOString()
    });
});

// ============================================
// GLOBAL ERROR HANDLER
// ============================================
app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// Export app for testing
module.exports = { app, pool };

// Support running this file directly with `node app.js` or nodemon.
if (require.main === module) {
    const port = Number(process.env.PORT || 5000);
    app.listen(port, () => {
        console.log(`Backend API listening on http://localhost:${port}`);
    });
}