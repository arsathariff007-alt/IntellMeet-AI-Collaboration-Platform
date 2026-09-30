const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;

  // Check if token exists in headers (Authorization: Bearer <token>)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Split the Bearer token string into an array ['Bearer', 'TOKEN_STRING']
      const tokenArray = req.headers.authorization.split(' ');
      
      // ✅ FIXED: Grab the actual string element at index 1 of the split array
      token = tokenArray[1];

      // Verify token string cleanly
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch user data from DB (excluding password) and attach to request object
      req.user = await User.findById(decoded.id).select('-password');

      return next(); // Move to the next controller function safely
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};
