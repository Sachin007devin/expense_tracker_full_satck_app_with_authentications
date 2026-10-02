const {DataTypes, ENUM} = require('sequelize')
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
        allowNull:false
    },
    Category:{
        type:DataTypes.TEXT,
        allowNull:false
    },
    IsIncome:{
        type:DataTypes.ENUM('true','false'),
        defaultValue:'false'
    }
})

module.exports =Expense