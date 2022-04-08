// ---------------------------------------------------------------------------------------- //
// Require Packages


const mongoose = require("mongoose");
const shortid = require("shortid");
const validUrl = require("valid-url");
const model = require("../models/model");
const urlReg = /^((ftp|http|https):\/\/)?(www.)?(?!.*(ftp|http|https|www.))[a-zA-Z0-9_-]+(\.[a-zA-Z]+)+((\/)[\w#]+)*(\/\w+\?[a-zA-Z0-9_]+=\w+(&[a-zA-Z0-9_]+=\w+)*)?$/
const redis = require("redis");


// ---------------------------------------------------------------------------------------- //
// Validation Format

const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    if (typeof value === 'number' && value.toString().trim().length === 0) return false
    return true;
};


// ---------------------------------------------------------------------------------------- //
// Redis


const { promisify } = require("util");

//Connect to redis
const redisClient = redis.createClient(
    18182,
    "redis-18182.c264.ap-south-1-1.ec2.cloud.redislabs.com",
    { no_ready_check: true }
);
redisClient.auth("7IX9vyy6Xo7sbQIHyHSkiNKesEGCkDsW", function (err) {
    if (err) throw err;
});

redisClient.on("connect", async function () {
    console.log("Connected to Redis..");
});



//1. connect to the server
//2. use the commands :

//Connection setup for redis

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);


// ---------------------------------------------------------------------------------------- //
// Create API

const createShortUrl = async function (req, res) {
    try {
        let data = req.body;
        let { longUrl } = data;

        if (!isValid(data)) {
            res.status(400).send({ status: false, msg: "Please provide input via body" })
            return
        }
        if (!isValid(longUrl)) {
            res.status(400).send({ status: false, msg: "Please provide long url" })
            return
        }
        if (!(urlReg.test(longUrl.trim()))) {
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
        await SET_ASYNC(`${data.urlCode}`, JSON.stringify(data.longUrl))
        res.status(201).send({ status: true, data: { "longUrl": SavedUrl.longUrl, "shortUrl": SavedUrl.shortUrl, "urlCode": SavedUrl.urlCode } })
        return

    } catch (error) {
        console.log(error);
        req.status(500).send({ msg: error.message });
    }
};


// -------------------------------------------------------------------------------------- //
// Get API

const getOriginalUrl = async function (req, res) {
    try {
        const urlCode = req.params.urlCode

        if (!isValid(urlCode)) {
            res.status(400).send({ status: false, msg: "please provide urlcode" })
            return
        }

        const cahcedOrginalUrl = await GET_ASYNC(`${urlCode}`)
        if (isValid(cahcedOrginalUrl)) {

            let redirectingData = JSON.parse(cahcedOrginalUrl)

            res.status(302).redirect(redirectingData)
            return

        } else {

            const urlData = await model.findOne({ urlCode: urlCode })
            if (!isValid(urlData)) {
                res.status(404).send({ status: false, msg: "url not found" })
                return
            }

            await SET_ASYNC(`${urlCode}`, JSON.stringify(urlData.longUrl))
            res.status(302).redirect(urlData.longUrl)
            return
        }
    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
        return
    }
};



// ---------------------------------------------------------------------------------------- //
// Exports

module.exports.createShortUrl = createShortUrl;
module.exports.getOriginalUrl = getOriginalUrl;