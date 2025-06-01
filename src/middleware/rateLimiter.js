import ratelimit from '../config/upstash.js';

const rateLimiter = async (req, res, next) => {
    try {
        // Extract user ID from the request (assuming it's in the headers)
        //const userId = req.headers['x-user-id'] || req.body.user_id;
        const userId = req.headers['x-user-id'];

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        // Check rate limit
        const result = await ratelimit.limit(userId);

        if (!result.success) {
            return res.status(429).json({ error: 'Too many requests, please try again later.' });
        }

        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        console.error('Rate limiter error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

export default rateLimiter;
// This middleware checks the rate limit for the user based on their ID.