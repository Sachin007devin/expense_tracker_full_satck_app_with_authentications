const centralHandler = require('../utils/central.handler')
const userModel = require('../models/user.model')

const fetch_LeaderBoard_Data = async (req, res) => {
    try {

        const user = await userModel.findAll({
            attributes:['Username','total_expense'],
            order:[['total_expense','DESC']],
            raw:true
            
        })

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

module.exports = {
    fetch_LeaderBoard_Data
};
