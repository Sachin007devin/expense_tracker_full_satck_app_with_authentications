const response = (res,dataObj) => {
    const statusCode = dataObj.statusCode
    const message = dataObj.message
    const data = dataObj.data
    const token = dataObj?.token
    res.status(statusCode).json({
        success: true,
        message,
        data,
        token
    })
}

const errorResponse = (res, err) => {
    const statusCode = err.statusCode
    const error = err.error
    const message = err.message
    console.log(error)
    res.status(statusCode).json({
        success: false,
        message,
        error
    })
}

module.exports = {
    errorResponse,
    response
}