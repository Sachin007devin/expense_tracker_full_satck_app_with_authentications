const expenseModel = require('../models/expense.model')
const userModel = require('../models/user.model')
const fileUrlModel = require('../models/fileUrl.model')
const centralHandler = require('../utils/central.handler')
const sequelize = require('../utils/db.connection')

// migration model testing 
const { ExpenseMigrated } = require('../migration_db/models')

// AI parts
const genai = require('@google/genai')
const { where } = require('sequelize')

//initializing ai
const ai = new genai.GoogleGenAI({
    apiKey: process.env.GOOGLE_AI_API_KEY
})

// S3 setup
const AWS = require('aws-sdk')
async function uploadToS3(data, filename) {

    const BUCKET_NAME = `${process.env.AWS_BUCKET_NAME}`
    const IAM_USER_KEY = process.env.AWS_S3_BOT_ACCESS_KEY
    const IAM_USER_SECRET_KEY = process.env.AWS_S3_BOT_SECRET_KEY

    const s3Bucket = new AWS.S3({
        accessKeyId: IAM_USER_KEY,
        secretAccessKey: IAM_USER_SECRET_KEY,
    })

    const params = {
        Bucket: BUCKET_NAME,
        Key: filename,
        Body: data,
        ContentType: 'application/json',
        ContentDisposition: 'attachment; filename="myexpense.json"',
        ACL: 'public-read'
    }

    const result = await s3Bucket.upload(params).promise()
    console.log('AWS S3 Upload Result:', result)

    return result.Location

}

async function getAiResponse(expense_description) {
    try {
        const response = await ai.interactions.create({
            model: "gemini-3.8-flash",
            input: `give one Category in one word for the expense with description ${expense_description}`
        })
        return response.output_text
    } catch (error) {
        console.log(error)
        throw Error(error)
    }
}

const addExpense = async (req, res) => {
    const transaction = await sequelize.transaction()
    try {
        const { expense_amount, expense_description,IsIncome } = req.body
        const userDetail = req.user

        if (!expense_amount || !expense_description || !IsIncome) {
            await transaction.rollback()
            const err = {
                statusCode: 400,
                error: 'missing fields',
                message: 'all fields are required .Please check and Fill Properly'
            }
            centralHandler.errorResponse(res, err)
            return
        }

        // creating the category
        let expense_category;
        if(IsIncome === 'true'){
            expense_category='Income'
        }
        else{
            // const expense_category = await getAiResponse(expense_description)
             expense_category = 'testing_for_aws'
        }


        const expense = await expenseModel.create({
            Amount: expense_amount,
            Description: expense_description,
            Category: expense_category,
            IsIncome:IsIncome,
            UserId: userDetail.id
        }, { transaction })

        if(IsIncome ==='false'){

            const total_expense = userDetail.total_expense === null ? 0 : userDetail.total_expense
            const updated_total_expense = Number(total_expense) + Number(expense_amount)

            await userModel.update(
                { total_expense: updated_total_expense },
                { where: { id: userDetail.id }, transaction }
            )
        }
        await transaction.commit()

        const dataObj = {
            statusCode: 201,
            message: 'expense stored Successfully',
            data: expense
        }

        centralHandler.response(res, dataObj)

    } catch (error) {
        await transaction.rollback()
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
        const { pageNumber, rows_limit } = req.query
        const page = Number(pageNumber)
        const userDetail = req.user

        const fixed_limit = Number(rows_limit)

        const expenses = await expenseModel.findAndCountAll({
            where: {
                UserId: userDetail.id
            },
            limit: fixed_limit,
            offset: (page - 1) * fixed_limit,
            order: [['createdAt', 'DESC']]
        })

        if (!expenses) {
            const err = {
                statusCode: 400,
                error: 'expense not found for the user',
                message: 'try adding some expenses first!!'
            }
            centralHandler.errorResponse(res, err)
            return
        }

        const expenses_result = expenses.rows // array of objects
        const total_number_of_expenses = expenses.count
        const maximum_pages = Math.ceil(total_number_of_expenses / fixed_limit) || 1

        const dataObj = {
            statusCode: 200,
            message: 'expenses fetched successfully',
            data: {
                expenses: expenses_result,
                currentPageVal: page,
                hasPreviousPage: page > 1,
                previousPageVal: page > 1 ? page - 1 : null,
                hasNextPage: page < maximum_pages,
                nextPageVal: page < maximum_pages ? page + 1 : null
            }
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
    const transaction = await sequelize.transaction()
    try {
        const { id } = req.params
        const userDetail = req.user

        const { expense_amount, expense_description,IsIncome } = req.body

        if (!expense_amount || !expense_description || !IsIncome) {
            await transaction.rollback()
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
            },
            transaction
        })

        if (!expense) {
            await transaction.rollback()
            const err = {
                statusCode: 404,
                error: 'expense not found !!',
                message: 'try again after some time or check the id provided'
            }
            centralHandler.errorResponse(res, err)
            return
        }

        // handling logic for  user's total_expense field when  expense amount updates
        const oldAmount = Number(expense.Amount)

        expense.Amount = expense_amount
        expense.Description = expense_description

        if(IsIncome === 'false'){

            // expense.Category = await getAiResponse(expense_description)
            expense.Category ='testing'
        }
        else{
            expense.Category ='Income'
        }

        await expense.save({ transaction })

        if(IsIncome ==='false'){

            const difference = Number(expense_amount) - oldAmount
            const user = await userModel.findByPk(userDetail.id, { transaction })
    
            user.total_expense = Number(user.total_expense || 0) + difference
            await user.save({ transaction })
        }

        await transaction.commit()

        const dataObj = {
            statusCode: 200,
            message: 'expense updated Successfully',
            data: expense
        }

        centralHandler.response(res, dataObj)

    } catch (error) {
        await transaction.rollback()
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
    const transaction = await sequelize.transaction()
    try {
        const { id } = req.params
        const userDetail = req.user

        const ExpenseDetail = await expenseModel.findOne({
            where: { id: id, UserId: userDetail.id },
            transaction
        })

        if (!ExpenseDetail) {
            await transaction.rollback()
            const err = {
                statusCode: 404,
                error: 'expense not found !!',
                message: 'try again after some time or check the id provided'
            }
            centralHandler.errorResponse(res, err)
            return
        }

        const expense_amount = ExpenseDetail.Amount
        const IsIncome = ExpenseDetail.IsIncome

        await ExpenseDetail.destroy({ transaction })

        if(IsIncome === 'false'){

            const total_expense = userDetail.total_expense === null ? 0 : userDetail.total_expense
            const updated_total_expense = Number(total_expense) - Number(expense_amount)
    
            await userModel.update(
                { total_expense: updated_total_expense },
                { where: { id: userDetail.id }, transaction }
            )
        }

        await transaction.commit()

        const dataObj = {
            statusCode: 200,
            message: 'expense deleted Successfully',
        }

        centralHandler.response(res, dataObj)
    } catch (error) {
        await transaction.rollback()
        console.log(error)
        const err = {
            statusCode: 500,
            error: error.message,
            message: 'Some internal error occurred'
        }
        centralHandler.errorResponse(res, err)
    }
}

const downloadExpense = async (req, res) => {
    try {
        const userDetail = req.user
        console.log('user detail from download expense controller=>', userDetail)
        const expenses = await expenseModel.findAll({
            where: {
                UserId: userDetail.id
            },
            raw: true
        })

        if (!expenses || expenses.length === 0) {
            const err = {
                statusCode: 404,
                error: 'Expense not found',
                message: 'No expenses found for this user. Try adding some expenses first!'
            }
            return centralHandler.errorResponse(res, err)
        }


        const stringifiedExpenses = JSON.stringify(expenses)
        const filename = `expenses/user_${userDetail.id}/${Date.now()}_expense.json`
        const fileUrl = await uploadToS3(stringifiedExpenses, filename)

        const isFileUrlStored = await fileUrlModel.create({ url: fileUrl, UserId: userDetail.id })

        if (!isFileUrlStored) {
            const err = {
                statusCode: 500,
                error: 'url not stored in db',
                message: 'there is some error while storing url in db'
            }
            return centralHandler.errorResponse(res, err)
        }

        const dataObj = {
            statusCode: 200,
            message: 'expense file url generated',
            data: { fileUrl }
        }
        centralHandler.response(res, dataObj)
    } catch (error) {
        console.error('Error in downloadExpense controller:', error)
        const err = {
            statusCode: 500,
            error: error.message,
            message: 'Some internal error occurred'
        }
        return centralHandler.errorResponse(res, err)
    }
}

const getDownloadedFiles = async (req, res) => {
    try {
        const userDetail = req.user
        const fileUrls = await fileUrlModel.findAll({
            where: {
                UserId: userDetail.id
            }
        })

        if (fileUrls.length === 0) {
            const err = {
                statusCode: 404,
                error: 'fileUrls for the user not found',
                message: "it seems you haven't download any files yet "
            }
            return centralHandler.errorResponse(res, err)
        }

        const dataObj = {
            statusCode: 200,
            message: 'expense file url fetched successfully',
            data: fileUrls
        }
        centralHandler.response(res, dataObj)
    } catch (error) {
        console.log(error)
        const err = {
            statusCode: 500,
            error: error.message,
            message: 'Some internal error occurred'
        }
        return centralHandler.errorResponse(res, err)
    }
}


const fetchReportData = async (req, res) => {
    try {
        
        const userDetail = req.user
        console.log('usedetail>>>>',userDetail)
        const expenses = await expenseModel.findAll({
            where:{
                UserId: userDetail.id
            },
            order:[['createdAt','ASC']]
        })

        if (!expenses) {
            const err = {
                statusCode: 400,
                error: 'expense not found for the user',
                message: 'try adding some expenses first!!'
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

const addMigratedExpense = async (req, res) => {
    try {
        const { expense_amount, expense_description, note } = req.body

        if (!expense_amount || !expense_description || !note) {
            const err = {
                statusCode: 400,
                error: 'missing fields',
                message: 'all fields are required .Please check and Fill Properly'
            }
            centralHandler.errorResponse(res, err)
            return
        }

        // creating the category
        // const expense_category = await getAiResponse(expense_description)
        const expense_category = 'testing_migration'


        const expense = await ExpenseMigrated.create({
            amount: expense_amount,
            description: expense_description,
            category: expense_category,
            note
        })

        // const total_expense = userDetail.total_expense === null ? 0 : userDetail.total_expense
        // const updated_total_expense = Number(total_expense) + Number(expense_amount)

        // console.log('total expense >>>>>', total_expense, typeof total_expense)
        // console.log('total expense >>>>>', total_expense)
        // console.log('updated total expense >>>>>', updated_total_expense)

        // await userModel.update(
        //     { total_expense: updated_total_expense },
        //     { where: { id: userDetail.id }, transaction }
        // )
        // await transaction.commit()

        const dataObj = {
            statusCode: 201,
            message: 'expense stored Successfully',
            data: expense
        }

        centralHandler.response(res, dataObj)

    } catch (error) {
        // await transaction.rollback()
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
    deleteExpense,
    downloadExpense,
    getDownloadedFiles,
    fetchReportData,
    addMigratedExpense
}