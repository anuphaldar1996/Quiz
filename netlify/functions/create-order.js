// Netlify function for secure Razorpay order creation
const Razorpay = require('razorpay');

exports.handler = async (event, context) => {
    // Enable CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    // Handle preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    // Only allow POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        // Verify authentication
        const authHeader = event.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: 'Unauthorized' })
            };
        }

        // Verify Firebase token (in production, validate the token)
        // This is simplified - in production, verify the Firebase token

        const { amount, currency, receipt } = JSON.parse(event.body);

        // Initialize Razorpay with environment variables
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });

        // Create order
        const order = await razorpay.orders.create({
            amount: Math.round(amount), // Amount in paise
            currency: currency || 'INR',
            receipt: receipt,
            payment_capture: 1
        });

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(order)
        };

    } catch (error) {
        console.error('Razorpay order creation error:', error);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Failed to create order',
                details: error.message 
            })
        };
    }
};