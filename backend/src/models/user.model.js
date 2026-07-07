const mongoose   = require('mongoose')
const bcrypt     = require('bcryptjs')
const jwt        = require('jsonwebtoken')


const userSchema = new mongoose.Schema({

    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: [true, 'Email already exists'],
        trim: true,
        lowercase: true,
        minLength: [6, 'Email must be at least 6 characters long'],
        maxLength: [50, 'Email must not be longer than 50 characters'],
        match: [
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            'Please enter a valid email address'
        ]
    },

    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 3 characters long'],
        select: false
    }

}, {
    timestamps: true
})


// Auto-hash password before save — same pattern as LedgerX
userSchema.pre('save', async function () {

    if (!this.isModified('password')) {
        return
    }

    const hash    = await bcrypt.hash(this.password, 10)
    this.password = hash
})


userSchema.methods.isValidPassword = async function (password) {
    return await bcrypt.compare(password, this.password)
}

// Sign with userId so auth middleware can do findById(decoded.userId)
userSchema.methods.generateJWT = function () {
    return jwt.sign(
        { userId: this._id, email: this.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    )
}


const userModel = mongoose.model('user', userSchema)

module.exports = userModel