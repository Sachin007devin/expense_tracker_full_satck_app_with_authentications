const userModel = require('../models/user.model')

const findUserByEmail = async (email) => {
    try {
        const user = await userModel.findOne({
            where: {
                Email: email
            }
        })
        return user
    } catch (error) {
        throw Error(error)
    }

}

module.exports = {
findUserByEmail
}