import jwt from 'jsonwebtoken';

// Authenticate JWT Token
export const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: Token missing or invalid' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Forbidden: Token expired or invalid' });
  }
};

// Check if user's email is verified
export const requireVerifiedEmail = (req, res, next) => {
  if (!req.user || !req.user.isVerified) {
    return res.status(403).json({ message: 'Forbidden: Email verification required' });
  }
  next();
};
