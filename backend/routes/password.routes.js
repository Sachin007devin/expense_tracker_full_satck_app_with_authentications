
const express = require('express')

const router = express.Router()

const passwordController = require('../controller/password.controller')

router.post('/forgotpassword',passwordController.resetPassword)

router.get('/ResetPassword/:forgotPasswordRequestId' , passwordController.checkIsForgotPasswordRequestValid)

router.post('/confirmPassword/:forgotPasswordRequestId' , passwordController.updatePassword)

module.exports = router