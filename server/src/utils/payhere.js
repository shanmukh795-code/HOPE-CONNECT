const crypto = require('crypto');

const generatePayHereHash = (merchantId, orderId, amount, currency, merchantSecret) => {
    // Format amount to 2 decimal places
    const formattedAmount = parseFloat(amount).toFixed(2);

    // Hash the secret
    const hashedSecret = crypto.createHash('md5')
        .update(merchantSecret)
        .digest('hex')
        .toUpperCase();

    // Create the final hash string
    // merchant_id + order_id + amount + currency + hashed_secret
    const hashString = `${merchantId}${orderId}${formattedAmount}${currency}${hashedSecret}`;

    // Generate the final hash
    return crypto.createHash('md5')
        .update(hashString)
        .digest('hex')
        .toUpperCase();
};

module.exports = { generatePayHereHash };
