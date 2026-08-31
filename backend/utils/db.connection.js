const Sequelize = require('sequelize')

const sequelize = new Sequelize('expense_tracker_full_stack_db','root','9892062571',{
    host:'localhost',
    dialect:'mysql'
})


const authenticate = async()=>{
    try {
        await sequelize.authenticate()
        console.log('establishing the econnection with database')
    } catch (error) {
        throw Error(error)
    }
}
authenticate()

module.exports = sequelize