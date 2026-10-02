const jwt = require('jsonwebtoken')
const userModel = require('../models/user.model')

const authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization')

        const userDetail = jwt.verify(token, process.env.SECRET_KEY)

        const user = await userModel.findByPk(userDetail.UserId)
        req.user = {id: user.id, username: user.Username , total_expense:user.total_expense}
        console.log('user detail >>>> form authenticate>>>>' , req.user)
        next()
    } catch (error) {
        console.error(error);
  return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

module.exports = {
    authenticate
}