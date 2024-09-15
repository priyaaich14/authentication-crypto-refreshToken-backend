import { Schema, model } from 'mongoose';
import crypto from 'crypto';

const userSchema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    refreshToken: { type: String },
}, { timestamps: true });

const hashPassword = async (password) => {
    try {
        const salt = crypto.randomBytes(16).toString('hex');
        const derivedKey = crypto.scryptSync(password, salt, 64);
        return `${salt}:${derivedKey.toString('hex')}`;
    } catch (error) {
        throw new Error('Error hashing password');
    }
};

const verifyPassword = async (hashedPassword, password) => {
    try {
        const [salt, key] = hashedPassword.split(':');
        const derivedKey = crypto.scryptSync(password, salt, 64);
        return key === derivedKey.toString('hex');
    } catch (error) {
        throw new Error('Error verifying password');
    }
};

// Pre-save hook to hash the password before saving
userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await hashPassword(this.password);
    }
    next();
});

const User = model('User', userSchema);

export { User, hashPassword, verifyPassword };
