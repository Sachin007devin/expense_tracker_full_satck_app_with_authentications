const centralHandler = require('../utils/central.handler')
const userModel = require('../models/user.model')
const { Sequelize } = require('sequelize')

const fetch_LeaderBoard_Data = async (req, res) => {
    try {
       
        // const userExpenseDetailArray = await userModel.findAll({
        //     attributes: [
        //         'id',
        //         'Username',
        //         // Direct SUM function without COALESCE
        //         [Sequelize.fn('SUM', Sequelize.col('Expenses.Amount')), 'total_Amount']
        //         // joh model defining k waqt diya ha i naam uska plural likhna hota hai naaki importation wala 
        //     ],
        //     include: [
        //         {
        //             model: expenseModel,
        //             attributes: [],
        //             required: false // LEFT OUTER JOIN (Zero expense users include karne ke liye)
        //         }
        //     ],
        //     group: ['id'],
        //     order: [[Sequelize.literal('total_Amount'), 'DESC']],
        //     raw: true
        // })

        const user = await userModel.findAll({
            attributes:['Username','total_expense'],
            order:[['total_expense','DESC']],
            raw:true
            
        })

        console.log('user')

        const dataObj = {
            statusCode: 200,
            message: 'leaderBoard  detail fetched successfully',
            data: user
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


// const centralHandler = require('../utils/central.handler')
// const expenseModel = require('../models/expense.model')
// const userModel = require('../models/user.model')
// const { Sequelize } = require('sequelize')

// const fetch_LeaderBoard_Data = async (req, res) => {
//     try {
//         const leaderBoardData = await userModel.findAll({
//             // 1. SELECT User details + SUM aggregate calculation
//             attributes: [
//                 'id',
//                 'Username',
//                 [
//                     // Aggregate SUM: COALESCE handles null for users with 0 expenses
//                     Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col('expenses.Amount')), 0),
//                     'totalExpense'
//                 ]
//             ],

//             // 2. LEFT OUTER JOIN with Expense table
//             include: [
//                 {
//                     model: expenseModel,
//                     attributes: [], // Attributes array empty rakhein kyunki hum sub-fields return nahi kar rahe
//                     required: false  // THIS IS CRITICAL: False ensures LEFT OUTER JOIN (Includes 0-expense users)
//                 }
//             ],

//             // 3. GROUP BY User.id
//             group: ['userModel.id'],

//             // 4. ORDER BY Total Expense (Highest spending user first)
//             order: [[Sequelize.literal('totalExpense'), 'DESC']],

//             raw: true // Plain JSON object array return karta hai
//         });
//         console.log(leaderBoardData)

//         const dataObj = {
//             statusCode: 200,
//             message: 'Leaderboard details fetched successfully',
//             data: leaderBoardData
//         };

//         centralHandler.response(res, dataObj);

//     } catch (error) {
//         console.error('Leaderboard Fetch Error:', error);
//         const err = {
//             statusCode: 500,
//             error: error.message,
//             message: 'Internal server error'
//         };
//         centralHandler.errorResponse(res, err);
//     }
// };

module.exports = {
    fetch_LeaderBoard_Data
};
