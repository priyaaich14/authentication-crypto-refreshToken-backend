import mongoose from "mongoose";
const configureDB = async () => {
    //const dbUrl = 'mongodb://localhost:27017/user-auth-mar24'//
    try{
        const db = await mongoose.connect(process.env.DB_URL)
        console.log('connected to db',db.connections[0].name)
    } catch (err) {
        console.log(err)
    }
}

export default configureDB