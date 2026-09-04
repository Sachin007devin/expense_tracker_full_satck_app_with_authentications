const jwt = require('jsonwebtoken')

const SECRET_KEY='testingsecret'
const generateToken = async (id, name) => {
    try {
        const token = jwt.sign({ UserId:id, Username:name }, SECRET_KEY)
        return token
    } catch (error) {
        throw Error(error)
    }
}

module.exports = generateToken