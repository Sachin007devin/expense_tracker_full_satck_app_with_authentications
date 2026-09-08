const express = require('express')

const router = express.Router()

const premiumController = require('../controller/premium.controller')

router.get('/LeaderBoard' , premiumController.fetch_LeaderBoard_Data)

module.exports = router