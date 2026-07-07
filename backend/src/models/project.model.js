const mongoose = require('mongoose')


const projectSchema = new mongoose.Schema({

    name: {
        type: String,
        lowercase: true,
        required: [true, 'Project name is required'],
        trim: true,
        unique: [true, 'Project name must be unique'],
        index: true
    },

    users: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }
    ],

    fileTree: {
        type: Object,
        default: {}
    },

    // Messages array so chat history survives page refresh
    messages: [
        {
            sender: {
                _id:   { type: String, required: true },
                email: { type: String }
            },
            message:   { type: String, required: true },
            createdAt: { type: Date, default: Date.now }
        }
    ]

}, {
    timestamps: true
})


const projectModel = mongoose.model('project', projectSchema)

module.exports = projectModel