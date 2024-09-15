import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import configureDB from './config/db.js';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { checkSchema } from 'express-validator';
import usersCltr from './app/controllers/user-cltr.js';
import authenticateUser from './app/middlewares/authentication.js';
import { userRegisterSchema, userLoginSchema } from './app/validators/user-validator.js';

dotenv.config()
const app = express()
const port = process.env.PORT || 3030

app.use(express.json())
app.use(cors())
app.use(cookieParser())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}))
configureDB()

app.post('/api/users/register', checkSchema(userRegisterSchema), usersCltr.register)
app.post('/api/users/login', checkSchema(userLoginSchema), usersCltr.login)
app.post('/api/users/refresh-token', usersCltr.refreshToken)
app.get('/api/users/account', authenticateUser, usersCltr.account)

app.listen(port, () => {
    console.log('port running on port', port)
})
