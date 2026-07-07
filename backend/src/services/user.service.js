const userModel = require('../models/user.model')


async function createUser({ email, password }) {

    if (!email || !password) {
        throw new Error('Email and password are required')
    }

    // No manual hashing here — userSchema pre('save') hook handles it
    const user = await userModel.create({
        email,
        password
    })

    return user
}

async function getAllUsers({ userId }) {

    const users = await userModel.find({
        _id: { $ne: userId }
    })

    return users
}


module.exports = {
    createUser,
    getAllUsers
}