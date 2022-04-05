// -------------------------------------------------------------------------------------- //
// Require Packages

const mongoose = require("mongoose");

// -------------------------------------------------------------------------------------- //
// Create Schema

const urlSchema = new mongoose.Schema({
    
    longUrl: {
        type: String,
        required: true,
        trim: true
    },
    shortUrl: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    urlCode: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    }
}, { timestamps: true });

// --------------------------------------------------------------------------------------- //
// Exports

module.exports = mongoose.model("Url", urlSchema);