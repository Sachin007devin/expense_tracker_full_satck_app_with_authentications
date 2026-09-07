const jwt = require('jsonwebtoken')
const userModel = require('../models/user.model')

const authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization')
        console.log(token, '<<<< from authenticate << token')

        const userDetail = jwt.verify(token, 'testingsecret')

        const user = await userModel.findByPk(userDetail.UserId)
        req.user = {id: user.id, email: user.Email, username: user.Username}
        console.log('req.user >>>>', req.user)
        next()
    } catch (error) {
        console.error(error);
  return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

module.exports = {
    authenticate
}