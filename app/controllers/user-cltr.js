import { User, hashPassword, verifyPassword } from '../models/user-model.js';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';

const usersCltr = {};

const generateAccessToken = (user) => {
    return jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
};

const generateRefreshToken = async (user) => {
    const refreshToken = jwt.sign({ userId: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
    user.refreshToken = refreshToken;
    await user.save();
    return refreshToken;
};

usersCltr.register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
        const user = new User({ email, password });
        await user.save();
        const refreshToken = await generateRefreshToken(user);
        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: false });
        res.status(201).json(user);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "something went wrong" });
    }
};

usersCltr.login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || !(await verifyPassword(user.password, password))) {
            return res.status(404).json({ error: 'invalid email or password' });
        }
        const accessToken = generateAccessToken(user);
        const refreshToken = await generateRefreshToken(user);
        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: false });
        res.json({ accessToken });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'something went wrong' });
    }
};

usersCltr.refreshToken = async (req, res) => {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
        return res.status(401).json({ message: 'No refresh token provided' });
    }
    try {
        const tokenData = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(tokenData.userId);
        if (!user || user.refreshToken !== refreshToken) {
            return res.status(403).json({ message: 'Invalid refresh token' });
        }
        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = await generateRefreshToken(user);
        res.cookie('refreshToken', newRefreshToken, { httpOnly: true, secure: false });
        res.json({ accessToken: newAccessToken });
    } catch (err) {
        console.log(err);
        res.status(403).json({ message: 'Invalid refresh token' });
    }
};

usersCltr.account = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        res.json(user);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'something went wrong' });
    }
};

export default usersCltr;
