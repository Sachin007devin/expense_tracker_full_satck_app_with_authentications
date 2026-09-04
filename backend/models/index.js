const userModel = require('./user.model')
const expenseModel = require('./expense.model')

userModel.hasMany(expenseModel)
expenseModel.belongsTo(userModel)