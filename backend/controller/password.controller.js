const { BrevoClient } = require('@getbrevo/brevo')
const centralHandler = require('../utils/central.handler')
const { findUserByEmail } = require('../services/user.dbWork')
const ForgotPassReqModel = require('../models/forgotPasswordRequest.model')
const userModel = require('../models/user.model')
const bcrypt = require('bcrypt')

const sequelize = require('../utils/db.connection')

const resetPassword = async (req, res) => {
    try {

        const { user_email } = req.body
        if (!user_email) {
            const err = {
                statusCode: 400,
                error: 'missing fields',
                message: 'all fields are required .Please check and Fill Properly'
            }
            centralHandler.errorResponse(res, err)
            return
        }

        const user = await findUserByEmail(user_email)

        if (!user) {
            const err = {
                statusCode: 400,
                error: 'Mail not found',
                message: 'May be this email is not registered with us .. try checking it again'
            }
            centralHandler.errorResponse(res, err)
            return
        }


        const forgotPassReq = await ForgotPassReqModel.create({
            UserId: user.id
        })

        const brevo = new BrevoClient({
            apiKey: process.env.SENDINBLUE_API_KEY
        })

        const result = await brevo.transactionalEmails.sendTransacEmail({

            sender: {
                email: 'rustystrtdx@gmail.com',
                name: 'Expense Tracker'
            },
            to: [
                { email: user_email }
            ],
            subject: 'Password Reset Request',
            htmlContent:
                `<h3>Password Reset Request</h3> 
                <a href='http://65.0.122.121:7777/password/ResetPassword/${forgotPassReq.id}'>Click here to reset your password.</a>`
        })

        console.log('Email sent successfully!')
        console.log(result)

        centralHandler.response(res, { statusCode: 200, message: 'Email sent successfully!', data: result })
    } catch (error) {
        console.error('Brevo API Error:')
        console.error(error)
        centralHandler.errorResponse(res, { statusCode: 500, error: error, message: 'Some Internal Server Error!!' })
    }

}

const checkIsForgotPasswordRequestValid = async (req, res) => {
    try {
        const { forgotPasswordRequestId } = req.params

        const isRequestValid = await ForgotPassReqModel.findOne({
            where: {
                id: forgotPasswordRequestId,
                isActive: 'True'
            }
        })

        if (!isRequestValid) {
            const err = {
                statusCode: 400,
                error: 'Request Expired',
                message: 'It seems your request for resetting password expired!!'
            }
            centralHandler.errorResponse(res, err)
            return
        }

        return res.redirect(`http://65.0.122.121:5500/frontend/resetPassword.html?request_id=${forgotPasswordRequestId}`)
    } catch (error) {
        console.error(error)
        centralHandler.errorResponse(res, { statusCode: 500, error: error, message: 'Some Internal Server Error!!' })

    }
}

const updatePassword = async (req, res) => {
    const transaction = await sequelize.transaction()
    try {
        const { forgotPasswordRequestId } = req.params
        const { updated_password } = req.body

        const forgotPasswordRequest = await ForgotPassReqModel.findByPk(forgotPasswordRequestId,{transaction})
        const UserId = forgotPasswordRequest.UserId

        forgotPasswordRequest.isActive = 'False'

        forgotPasswordRequest.save({ transaction })

        const user = await userModel.findByPk(UserId,{transaction})

        const hashedPassword = await bcrypt.hash(updated_password, 10)
        user.password = hashedPassword

        user.save({ transaction })

        transaction.commit()

        return centralHandler.response(res , {statusCode:200 , message:'Password updated successfully'})

    } catch (error) {
        transaction.rollback()
        console.log(error)
        centralHandler.errorResponse(res, { statusCode: 500, error, message: 'Some Internal Error Occured!!' })
    }
}

module.exports = {
    resetPassword,
    checkIsForgotPasswordRequestValid,
    updatePassword
}