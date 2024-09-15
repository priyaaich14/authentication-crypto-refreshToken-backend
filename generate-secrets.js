import crypto from 'crypto';

const generateSecret = () => crypto.randomBytes(32).toString('hex')

console.log(`ACCESS_TOKEN_SECRET=${generateSecret()}`)
console.log(`REFRESH_TOKEN_SECRET=${generateSecret()}`)
console.log(`SESSION_SECRET=${generateSecret()}`)
