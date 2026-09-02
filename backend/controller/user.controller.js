const centralHandler = require('../utils/central.handler')
const userModel = require('../models/user.model')
const { findUserByEmail } = require('../services/user.dbWork')

const bcrypt = require('bcrypt')

const registerUser = async (req, res) => {
    try {

        const { user_name, user_email, user_password } = req.body


        if (!user_name || !user_email || !user_password) {
            const err = {
                statusCode: 400,
                error: 'missing fields',
                message: 'all fields are required .Please check and Fill Properly'
            }
            centralHandler.errorResponse(res, err)
            return
        }

        const isUserExist = await findUserByEmail(user_email)

        if (isUserExist) {
            const err = {
                statusCode: 400,
                error: 'user Already Exist',
                message: 'try using Different Email or Sign In to your existing Account'
            }
            centralHandler.errorResponse(res, err)
            return
        }

        const hashedPassword = await bcrypt.hash(user_password, 10)

        const user = await userModel.create({
            Username: user_name,
            Email: user_email,
            password: hashedPassword
        })
        const dataObj = {
            statusCode: 201,
            message: 'user registered Successfully',
            data: user
        }

        centralHandler.response(res, dataObj)

    } catch (error) {
        console.log(error)
        const err = {
            statusCode: 500,
            error: error.message,
            message: 'Some internal error occurred'
        }
        centralHandler.errorResponse(res, err)
    }
}

const loginUser = async (req, res) => {
    try {
        const { user_email, user_password } = req.body

        if (!user_email || !user_password) {
            const err = {
                statusCode: 400,
                error: 'missing fields',
                message: 'all fields are required .Please check and Fill Properly'
            }
            centralHandler.errorResponse(res, err)
            return
        }

        const isUserExist = await findUserByEmail(user_email)

        if (!isUserExist) {
            const err = {
                statusCode: 404,
                error: 'user not found !!',
                message: 'create a new Account With us'
            }
            centralHandler.errorResponse(res, err)
            return
        }

        const isPasswordCorrect = bcrypt.compare(user_password, isUserExist.password)

        if (!isPasswordCorrect) {
            const err = {
                statusCode: 401,
                error: 'unAuthorized Access',
                message: 'user email or password is wrong'
            }
            centralHandler.errorResponse(res, err)
            return
        }
        const dataObj = {
            statusCode: 200,
            message: 'user logged in Successfully',
            data:isUserExist
        }

        centralHandler.response(res, dataObj)


    } catch (error) {
        console.log(error)
        const err = {
            statusCode: 500,
            error: error.message,
            message: 'Some internal error occurred'
        }
        centralHandler.errorResponse(res, err)
    }
}

module.exports = {
    registerUser,
    loginUser
}