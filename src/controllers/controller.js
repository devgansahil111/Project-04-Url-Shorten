// ---------------------------------------------------------------------------------------- //
// Require Packages

// const urlModel = require("../models/model");
const mongoose = require("mongoose");
const shortid = require("shortid");
const validUrl = require("valid-url");
const model = require("../models/model");

// ---------------------------------------------------------------------------------------- //
// Validation Format

const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    if (typeof value === 'number' && value.toString().trim().length === 0) return false
    return true;
};


// ---------------------------------------------------------------------------------------- //
// Create API

const createShortUrl = async function (req, res){
    try {
        let data = req.body;
        let { longUrl } = data;

        if(!isValid(data)) {
            res.status(400).send({ status: false, msg: "Please provide input via body" })
            return
        }
        if(!isValid(longUrl)) {
            res.status(400).send({ status: false, msg: "Please provide long url" })
            return
        }
        if(!validUrl.isWebUri(longUrl.trim())) {
            res.status(404).send({ status: false, msg: "Invalid Url" })
            return
        }
        data["urlCode"] = shortid.generate().toLowerCase()
        data["shortUrl"] = `http://localhost:3000/${data.urlCode}`

        const isUrlAlreadyShorten = await model.findOne({ longUrl: longUrl }).select({ __v: 0, createdAt: 0, updatedAt: 0, _id: 0 })
        if (isValid(isUrlAlreadyShorten)) {
            res.status(200).send({ status: true, data: isUrlAlreadyShorten })
            return
        }
        const SavedUrl = await model.create(data)
            res.status(201).send({ status: true, data: { "longUrl": SavedUrl.longUrl, "shortUrl": SavedUrl.shortUrl, "urlCode": SavedUrl.urlCode }})
            return

    } catch (error) {
        console.log(error);
        req.status(500).send({ msg: error.message });
    }
};


// -------------------------------------------------------------------------------------- //
// Get API

const getOriginalUrl = async function ( req, res ){
    try {
        const urlCode = req.params.urlCode;
        if(!isValid(urlCode)) {
            res.status(400).send({ status: false, msg: "Please provide urlcode"})
            return
        }
        const urlData = await model.findOne({ urlCode: urlCode })

        if(!isValid(urlData)){
            res.status(404).send({ status: false, msg: "Url not found" })
            return
        }
        console.log( urlData.longUrl )
            res.status(301).redirect( urlData.longUrl )
            return

    } catch (error) {
        console.log(error);
        res.status(500).send({ msg: error.message })
        return
    }
};


// ---------------------------------------------------------------------------------------- //
// Exports

module.exports.createShortUrl = createShortUrl;
module.exports.getOriginalUrl = getOriginalUrl;