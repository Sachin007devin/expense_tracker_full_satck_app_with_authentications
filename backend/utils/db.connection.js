const Sequelize = require('sequelize')

const sequelize = new Sequelize(process.env.DB_NAME,'root',process.env.DB_PASSWORD,{
    host:process.env.DB_HOST,
    dialect:'mysql'
})


const authenticate = async()=>{
    try {
        await sequelize.authenticate()
    } catch (error) {
        throw Error(error)
    }
}
authenticate()

module.exports = sequelize