const expenseModel = require('../models/expense.model')
const userModel = require('../models/user.model')
const centralHandler = require('../utils/central.handler')

const addExpense = async (req, res) => {
    try {
        const { expense_amount, expense_description, expense_category } = req.body
        const userDetail = req.user

        if (!expense_amount || !expense_description || !expense_category) {
            const err = {
                statusCode: 400,
                error: 'missing fields',
                message: 'all fields are required .Please check and Fill Properly'
            }
            centralHandler.errorResponse(res, err)
            return
        }

        const expense = await expenseModel.create({
            Amount: expense_amount,
            Description: expense_description,
            Category: expense_category,
            UserId: userDetail.id
        })

        const total_expense = userDetail.total_expense === null ? 0 : userDetail.total_expense
        const updated_total_expense = Number(total_expense) + Number(expense_amount)

        console.log('total expense >>>>>',total_expense,typeof total_expense)
        console.log('total expense >>>>>',total_expense)
        console.log('updated total expense >>>>>',updated_total_expense)

        await userModel.update(
            {total_expense:updated_total_expense},
            {where:{id:userDetail.id}}
        )

        const dataObj = {
            statusCode: 201,
            message: 'expense stored Successfully',
            data: expense
        }

        centralHandler.response(res, dataObj)



    } catch (error) {
        console.log(error)
        const err = {
            statusCode: 500,
            error: error.message,
            message: 'Some internal error occurred'
        }
        centralHandler.errorResponse(res, err)
    }
}

const getExpenses = async (req, res) => {
    try {
        const userDetail = req.user
        console.log('userdetail from controller <<<<', userDetail)
        console.log('userId >>>>', userDetail.id)
        const expenses = await expenseModel.findAll({
            where: {
                UserId: userDetail.id
            }
        })
        if (expenses.length === 0) {
            const err = {
                statusCode: 404,
                error: 'no expense added yet',
                message: 'try adding some expenses first'
            }
            centralHandler.errorResponse(res, err)
            return
        }
        const dataObj = {
            statusCode: 200,
            message: 'expenses fetched successfully',
            data: expenses
        }

        centralHandler.response(res, dataObj)
    } catch (error) {
        console.log(error)
        const err = {
            statusCode: 500,
            error: error.message,
            message: 'Some internal error occurred'
        }
        centralHandler.errorResponse(res, err)
    }
}

const editExpense = async (req, res) => {
    try {
        const { id } = req.params
 const userDetail = req.user

        const { expense_amount, expense_description, expense_category } = req.body

        if (!expense_amount || !expense_description || !expense_category) {
            const err = {
                statusCode: 400,
                error: 'missing fields',
                message: 'all fields are required .Please check and Fill Properly'
            }
            centralHandler.errorResponse(res, err)
            return
        }

       const expense = await expenseModel.findOne({
            where: {
                id: id,
                UserId: userDetail.id
            }
        })

        if (!expense) {
            const err = {
                statusCode: 404,
                error: 'expense not found !!',
                message: 'try again after some time or check the id provided'
            }
            centralHandler.errorResponse(res, err)
            return
        }

        expense.Amount = expense_amount
        expense.Description = expense_description
        expense.Category = expense_category

        await expense.save()

        const dataObj = {
            statusCode: 200,
            message: 'expense updated Successfully',
            data: expense
        }

        centralHandler.response(res, dataObj)

    } catch (error) {
        console.log(error)
        const err = {
            statusCode: 500,
            error: error.message,
            message: 'Some internal error occurred'
        }
        centralHandler.errorResponse(res, err)
    }
}

const getExpenseByid = async (req, res) => {
    try {
        const { id } = req.params
        const userDetail = req.user
        const expense = await expenseModel.findOne({
            where: {
                id: id,
                UserId: userDetail.id
            }
        })

        if (!expense) {
            const err = {
                statusCode: 404,
                error: 'expense not found !!',
                message: 'try again after some time or check the id provided'
            }
            centralHandler.errorResponse(res, err)
            return
        }

        const dataObj = {
            statusCode: 200,
            message: 'expense fetched Successfully',
            data: expense
        }

        centralHandler.response(res, dataObj)

    } catch (error) {
        console.log(error)
        const err = {
            statusCode: 500,
            error: error.message,
            message: 'Some internal error occurred'
        }
        centralHandler.errorResponse(res, err)
    }
}

const deleteExpense = async (req, res) => {
    try {
        const { id } = req.params
        const userDetail = req.user

        const ExpenseDetail = await expenseModel.findByPk(id)
        const expense_amount = ExpenseDetail.Amount

        // console.log(expense_amount,'expense deleting data <<<<<<<<<<<')

        if (!ExpenseDetail) {
            const err = {
                statusCode: 404,
                error: 'expense not found !!',
                message: 'try again after some time or check the id provided'
            }
            centralHandler.errorResponse(res, err)
            return
        }

        await ExpenseDetail.destroy()

        const total_expense = userDetail.total_expense === null ? 0 : userDetail.total_expense
        const updated_total_expense = Number(total_expense) - Number(expense_amount)

        // console.log('total expense >>>>> subtracted',total_expense,typeof total_expense)
        // console.log('total expense >>>>>',total_expense)
        // console.log('updated total expense >>>>>',updated_total_expense)


        await userModel.update(
            {total_expense:updated_total_expense},
            {where:{id:userDetail.id}}
        )

        const dataObj = {
            statusCode: 200,
            message: 'expense deleted Successfully',
        }

        centralHandler.response(res, dataObj)
    } catch (error) {
        console.log(error)
        const err = {
            statusCode: 500,
            error: error.message,
            message: 'Some internal error occurred'
        }
        centralHandler.errorResponse(res, err)
    }
}

module.exports = {
    addExpense,
    getExpenses,
    editExpense,
    getExpenseByid,
    deleteExpense
}