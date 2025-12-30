const cors = require('cors');

const corsOptions = {
    origin: [
        'http://localhost:5173', // Vite default port
        'http://127.0.0.1:5173',
        'http://localhost:5001',
        'http://127.0.0.1:5001'
    ],
    credentials: true,
    optionsSuccessStatus: 200
};

module.exports = cors(corsOptions);
