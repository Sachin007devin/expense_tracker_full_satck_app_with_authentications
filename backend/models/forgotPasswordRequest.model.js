const { DataTypes } = require('sequelize')
const sequelize = require('../utils/db.connection')

const ForgotPassReq = sequelize.define('ForgotPassReq', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4, 
        allowNull: false,
        primaryKey: true
    },
    isActive: {
        type: DataTypes.ENUM('True', 'False'),
        defaultValue: 'True'
    }
})

module.exports = ForgotPassReq