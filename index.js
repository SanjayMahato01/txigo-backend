import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './db/db.js';
import cors from "cors";
import adminRouter from './routes/admin.route.js';
import cookieParser from 'cookie-parser';
import morgan from "morgan";
import expressWs from 'express-ws';
import cron from 'node-cron';
import { initializeEmailScheduler } from './controllers/promotionalEmail.controller.js';
import { updateMissedOrders } from './utils/cornJobs.js';
import { createServer } from 'http';
import path from 'path';
import fs from 'fs';

// Import all route files
import oneWayCabsRouter from './routes/oneWayCabs.route.js';
import carRouter from './routes/car.route.js';
import userRouter from './routes/user.route.js';
import airportRouter from './routes/airport.route.js';
import orderRouter from './routes/order.route.js';
import otpRouter from './routes/otp.route.js';
import blogRouter from './routes/blog.route.js';
import headingRouter from './routes/heading.route.js';
import careerRouter from './routes/career.route.js';
import corporateRouter from './routes/corporate.route.js';
import contactRouter from './routes/contact.route.js';
import travelAgentRouter from './routes/travelAgent.route.js';
import newsletterRouter from './routes/newsletter.route.js';
import searchRouter from './routes/search.route.js';
import promotionalEmailRouter from './routes/promotionalEmail.route.js';
import cityRouter from './routes/city.route.js';
import driverRouter from './routes/driver.route.js';
import vendorRouter from './routes/vendor.route.js';
import pricingRouter from './routes/pricingFleet.route.js';
import vendorCarRouter from './routes/vendorCar.route.js';
import myDriverRouter from './routes/myDriver.route.js';
import paymentHistoryRouter from './routes/paymentHistory.route.js';
import earningHistoryRouter from './routes/earningHistory.route.js';
import bankRouter from './routes/bank.route.js';
import tripExecutedRouter from './routes/tripExecuted.route.js';
import tripReviewsRouter from './routes/tripReviews.route.js';
import penaltyRouter from './routes/penalty.route.js';
import incentiveRouter from './routes/incentive.route.js';
import bonusRouter from './routes/bonus.route.js';
import deleteDriverRequestRouter from './routes/deleteDriverRequest.route.js';
import deleteCarRequestRouter from './routes/deletCarRequest.route.js';
import supportChatRouter from './routes/supportChat.route.js';
import vendorFaqRouter from './routes/vendorFaq.route.js';
import vendorTicketRouter from './routes/ticket.route.js';
import referralRouter from './routes/referral.route.js';
import historyRouter from './routes/history.route.js';
import newBlogRouter from './routes/newBlog.route.js';
import blogCategoryRouter from './routes/blogCategory.route.js';
import xmlPageRouter from './routes/xmlPage.route.js';
import webStoriesRouter from './routes/webStories.route.js';
import pageContentRouter from './routes/pageContent.route.js';
import pageFaqRouter from './routes/pageFaq.route.js';
import driverContentRouter from './routes/driverContent.route.js';
import invoiceRouter from './routes/invoice.route.js'
import corporateInvoiceRouter from './routes/corporateInvoice.route.js';
import invoiceEmailRouter from './routes/inviceEmail.route.js';
import Driver2Router from './routes/driver-2.route.js';
import RazorPayRouter from './routes/razorpay.route.js';

// Load environment variables
dotenv.config();

// Create express app
const app = express();
const server = createServer(app);

// WebSocket setup
const wsInstance = expressWs(app, server);
const wss = wsInstance.getWss();

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));
app.use(cookieParser());

// CORS configuration
const corsOptions = {
    origin: [
        process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Static files
app.use('/uploads', express.static(uploadDir));

// WebSocket connection handling
wss.on('connection', (ws, req) => {
    const origin = req.headers.origin;
    const allowedOrigins = corsOptions.origin;
    
    if (!allowedOrigins.includes(origin)) {
        ws.close(1008, 'Origin not allowed');
        console.warn('WebSocket connection from disallowed origin:', origin);
        return;
    }
    console.log('New WebSocket connection established');
});

// Scheduled jobs

// initializeEmailScheduler();
cron.schedule('0 * * * *', () => {
    console.log("Running missed order check...");
    updateMissedOrders();
});
// API Routes
const API_PREFIX = '/api';
const routes = [
    { path: '/admin', router: adminRouter },
    { path: '/oneWayCabs', router: oneWayCabsRouter },
    { path: '/cars', router: carRouter },
    { path: '/user', router: userRouter },
    { path: '/airports', router: airportRouter },
    { path: '/orders', router: orderRouter },
    { path: '/otp', router: otpRouter },
    { path: '/blog', router: blogRouter },
    { path: '/heading', router: headingRouter },
    { path: '/career', router: careerRouter },
    { path: '/corporate', router: corporateRouter },
    { path: '/contact', router: contactRouter },
    { path: '/travelAgent', router: travelAgentRouter },
    { path: '/newsletter', router: newsletterRouter },
    { path: '/search', router: searchRouter },
    { path: '/promotional', router: promotionalEmailRouter },
    { path: '/city', router: cityRouter },
    { path: '/driver', router: driverRouter },
    { path: '/vendor', router: vendorRouter },
    { path: '/vendorPricing', router: pricingRouter },
    { path: '/vendorCar', router: vendorCarRouter },
    { path: '/myDriver', router: myDriverRouter },
    { path: '/paymentHistory', router: paymentHistoryRouter },
    { path: '/bank', router: bankRouter },
    { path: '/earningHistory', router: earningHistoryRouter },
    { path: '/tripExecuted', router: tripExecutedRouter },
    { path: '/tripReviews', router: tripReviewsRouter },
    { path: '/penalty', router: penaltyRouter },
    { path: '/incentive', router: incentiveRouter },
    { path: '/bonus', router: bonusRouter },
    { path: '/deleteDriverRequest', router: deleteDriverRequestRouter },
    { path: '/deleteDriverCarRequest', router: deleteCarRequestRouter },
    { path: '/supportChat', router: supportChatRouter },
    { path: '/vendorFaq', router: vendorFaqRouter },
    { path: '/vendorTicket', router: vendorTicketRouter },
    { path: '/referral', router: referralRouter },
    { path: '/history', router: historyRouter },
    { path: '/newBlog', router: newBlogRouter },
    { path: '/blog-categories', router: blogCategoryRouter },
    { path: '/xmlpage', router: xmlPageRouter },
    { path: '/web-stories', router: webStoriesRouter },
    { path: '/page-content', router: pageContentRouter },
    { path: '/pageFaq', router: pageFaqRouter },
    { path: '/driver-content', router: driverContentRouter },
    { path: '/invoice', router: invoiceRouter },
    { path: '/corporateInvoice', router: corporateInvoiceRouter },
    { path: '/invoiceEmail', router: invoiceEmailRouter },
    { path: '/driver2', router: Driver2Router },
    { path: '/razorpay', router: RazorPayRouter },
];

// Register all routes
routes.forEach(({ path, router }) => {
    app.use(`${API_PREFIX}${path}`, router);
});

// Health check endpoint
app.get(`${API_PREFIX}/health`, (req, res) => {
    res.status(200).json({ status: 'healthy' });
});



// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            message: 'Validation Error',
            errors: err.errors
        });
    }

    if (err.name === 'MulterError') {
        return res.status(400).json({
            message: 'File upload error',
            error: err.message
        });
    }

    res.status(500).json({ 
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Database connection and server start
connectDB()
    .then(() => {
        const PORT = process.env.PORT || 5001;
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    })
    .catch((error) => {
        console.error('Error while starting the server:', error);
        process.exit(1);
    });

export { app, server };