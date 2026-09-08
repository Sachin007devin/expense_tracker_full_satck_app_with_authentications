const centralHandler = require('../utils/central.handler')
const expenseModel = require('../models/expense.model')
const userModel = require('../models/user.model')

const fetch_LeaderBoard_Data = async (req, res) => {
    try {
        const expenseWithUserDetail = await expenseModel.findAll({
            include: [
                {
                    model: userModel,
                    attributes: ['Username']
                }
            ]
        })

        console.log('expensesWithDetails >>>>>>>',JSON.stringify(expenseWithUserDetail))

        // hashmap create krlo jaha username and amount store karoge andnthe fhir woha se array main convert krlege phirse and return kr skte hai 
        const userExpenseDetailHashMap = new Map()

        for(let detail of expenseWithUserDetail){
            const userName = detail.User.Username
            userExpenseDetailHashMap.set(userName,(userExpenseDetailHashMap.get(userName) || 0) + detail.Amount)
        }
        const userExpenseDetailArray = Array.from(userExpenseDetailHashMap)
        console.log('formatted detail >>>>>>>>>>>' , userExpenseDetailArray)
        
        const dataObj = {
            statusCode: 200,
            message: 'leaderBoard  detail fetched successfully',
            data: userExpenseDetailArray
        }

        centralHandler.response(res,dataObj)

    } catch (error) {
        const err = {
            statusCode: 500,
            error: error.message,
            message: 'Internal server error'
        }
        centralHandler.errorResponse(res, err)
        return
    }
}

module.exports={
    fetch_LeaderBoard_Data
}