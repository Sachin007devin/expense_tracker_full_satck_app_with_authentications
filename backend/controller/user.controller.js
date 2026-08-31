const centralHandler = require('../utils/central.handler')
const userModel = require('../models/user.model')

const registerUser = async(req,res)=>{
    try {
        
        const {user_name,user_email,user_password} = req.body
        

        if(!user_name || !user_email || !user_password){
            const err = {
                statusCode:400,
                error:'missing fields',
                message:'all fields are required .Please check and Fill Properly'
            }
            centralHandler.errorResponse(res,err)
            return
        }

        const isUserExist = await userModel.findAll({
            where:{
                Email:user_email
            }
        })

        if(isUserExist.length != 0){
             const err = {
                statusCode:400,
                error:'user Already Exist',
                message:'try using Different Email or Sign In to your existing Account'
            }
            centralHandler.errorResponse(res,err)
            return
        }

        const user = await userModel.create({
            Username:user_name,
            Email:user_email,
            password:user_password
        })
        const dataObj = {
            statusCode:201, 
            message:'user registered Successfully', 
            data:user
        }

        centralHandler.response(res,dataObj)

    } catch (error) {
         const err = {
                statusCode:500,
                error:error.message,
                message:'Some internal error occurred'
            }
        centralHandler.errorResponse(res,err)
    }
}

module.exports = {
    registerUser
}