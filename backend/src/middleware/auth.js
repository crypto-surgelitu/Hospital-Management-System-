const jwt = require('jsonwebtoken');

const VALID_ROLES = ['admin', 'doctor', 'nurse', 'pharmacist', 'lab', 'receptionist'];

/**
 * Verify JWT from Authorization header.
 * Attaches decoded payload to req.user on success.
 */
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
}

/**
 * Restrict access to specific roles.
 * Must be used AFTER verifyToken.
 *
 * @param {string[]} roles - Allowed roles, e.g. ['admin', 'doctor']
 */
function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    next();
  };
}

module.exports = { verifyToken, requireRole, VALID_ROLES };
