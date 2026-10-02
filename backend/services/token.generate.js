const jwt = require('jsonwebtoken')


const generateToken = async (id, name) => {
    try {
        const token = jwt.sign({ UserId:id, Username:name }, process.env.SECRET_KEY)
        return token
    } catch (error) {
        throw Error(error)
    }
}

module.exports = generateToken