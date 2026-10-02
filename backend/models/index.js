const userModel = require('./user.model')
const expenseModel = require('./expense.model')
const ForgotPassReqModel = require('./forgotPasswordRequest.model')
const fileUrlModel = require('./fileUrl.model')

// user to expense many to one relation
userModel.hasMany(expenseModel)
expenseModel.belongsTo(userModel)

// user to forgotPass many to one relation
userModel.hasMany(ForgotPassReqModel)
ForgotPassReqModel.belongsTo(userModel)

// user to fileurl many to one relation
userModel.hasMany(fileUrlModel)
fileUrlModel.belongsTo(userModel)