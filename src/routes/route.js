// ------------------------------------------------------------------------------------ //
// Require Packages

const express = require("express");
const router = express.Router();
const controller = require("../controllers/controller");


// ------------------------------------------------------------------------------------- //
// API's

router.post("/url/shorten", controller.createShortUrl);
router.get("/:urlCode", controller.getOriginalUrl);


// --------------------------------------------------------------------------------------- //
// Export

module.exports = router;