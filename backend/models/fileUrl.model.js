const {DataTypes} = require('sequelize')
const sequelize = require('../utils/db.connection')

const fileUrl = sequelize.define('filrUrl',{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true,
        allowNull:false
    },
    url:{
        type:DataTypes.TEXT,
        allowNull:false
    }
})

module.exports =fileUrl