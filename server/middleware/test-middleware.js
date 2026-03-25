process.env.JWT_SECRET = 'testsecret';
const jwt = require('jsonwebtoken');
const { verifyToken } = require('./middleware/auth');

const token = jwt.sign({ id: 1, role: 'admin', name: 'Test' }, 'testsecret');
const req = { headers: { authorization: `Bearer ${token}` } };
const res = { status: (c) => ({ json: (d) => console.log(c, d) }) };
verifyToken(req, res, () => console.log('✅ verifyToken passed. req.user:', req.user));