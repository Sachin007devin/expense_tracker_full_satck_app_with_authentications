const {DataTypes} =require('sequelize')
const sequelize = require('../utils/db.connection')

const payment = sequelize.define('Payment',{

  orderId: { type: DataTypes.STRING, allowNull: false, unique: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  amount: { type: DataTypes.FLOAT, allowNull: false },
  status: { type: DataTypes.ENUM('PENDING', 'SUCCESS', 'FAILED'), defaultValue: 'PENDING' },
  transactionId: { type: DataTypes.STRING }
}
)

module.exports = payment