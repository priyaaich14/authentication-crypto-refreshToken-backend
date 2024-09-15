import jwt from 'jsonwebtoken';

export default function authenticateUser(req, res, next) {
    const token = req.headers['authorization']
    if (!token) {
        return res.status(401).json({ errors: 'token is required' })
    }
    try {
        const tokenData = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        req.userId = tokenData.userId
        next()
    } catch (err) {
        return res.status(401).json({ errors: err.message })
    }
}
