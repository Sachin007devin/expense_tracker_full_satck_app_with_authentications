const expenseModel = require('../models/expense.model')
const centralHandler = require('../utils/central.handler')

const addExpense = async (req, res) => {
    try {
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

        const expense = await expenseModel.create({
            Amount: expense_amount,
            Description: expense_description,
            Category: expense_category
        })

        const dataObj = {
            statusCode: 201,
            message: 'user registered Successfully',
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

const getExpenses = async(req , res)=>{
    try {
        const expenses = await expenseModel.findAll()
        if (expenses.length ===0) {
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

module.exports = {
    addExpense,
    getExpenses
}