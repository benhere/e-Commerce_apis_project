
const express = require('express');
require('dotenv').config();
require('express-async-errors');
const server = express();

// rest of used packages

const cookieParser = require('cookie-parser');

// morgan middlware for logging
const morgan = require('morgan');

// to handle file upload we will use 'express-fileupload'
const fileUpload = require('express-fileupload');

// express-rate-limiter and security related packages
const rateLimiter = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');

// Swagger setup
const swaggerUI = require('swagger-ui-express');
const YAML = require('yamljs');

// load swagger
const swaggerDocument = YAML.load('./swagger.yml')

// database connection
const connectDB = require('./db/DBConnection');

// routers
const authRoute = require('./routes/authRoutes');
const userRoute = require('./routes/userRoutes');
const productRoute = require('./routes/productRoutes');
const reviewRoute = require('./routes/reviewRoutes');
const orderRoute = require('./routes/orderRoutes');

// middleaware setup ans error handling

// host public folder (static files)
server.use(express.static('./public'));
server.use(fileUpload());

// middleware imports
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

// set proxy
server.set('trust proxy', 1);
server.use(rateLimiter({
    windowMs: 15*60*1000,
    max: 60,
}));

server.use(helmet());
server.use(cors());
server.use(xss());
server.use(mongoSanitize());

// swagger UI docx route setup
server.use('/api-use', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

// middleware setup for morgan for logging
// server.use(morgan('tiny'));

// middleware setup to access JSON data
server.use(express.json())

// middleware setup to access cookie on server
server.use(cookieParser(process.env.JWT_SECRET));

server.use('/api/v1/auth', authRoute);
server.use('/api/v1/users', userRoute);
server.use('/api/v1/products', productRoute);
server.use('/api/v1/reviews', reviewRoute);
server.use('/api/v1/orders', orderRoute);

server.use(notFoundMiddleware);
server.use(errorHandlerMiddleware);

const portNo = process.env.PORT || 7474;
const mongo_URI = process.env.mongoURL;

const startServer = async () => {
    try {
        await connectDB(mongo_URI)
        .then(() => console.log('DB Connected'))
        server.listen(portNo, () => {
            console.log(`Server is listening on port ${portNo}...`);
        })
    } catch (error) {
        console.log(error);
    }
}

startServer();