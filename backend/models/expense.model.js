const {DataTypes} = require('sequelize')
const sequelize = require('../utils/db.connection')

const Expense = sequelize.define('Expense',{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true,
        allowNull:false
    },
    Amount:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    Description:{
        type:DataTypes.STRING,
        allowNull:false,
        unique:true
    },
    Category:{
        type:DataTypes.STRING,
        allowNull:false
    }
})

module.exports =Expense