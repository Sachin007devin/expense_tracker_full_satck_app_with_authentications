const express = require('express')
const app = express()

// db connection
const db = require('./utils/db.connection')

//models
require('./models/user.model')

//routes
const userRoutes = require('./routes/user.routes')


//middleware
app.use(express.json())
app.use('/users',userRoutes)


db.sync({alter:true}).then(()=>{
    app.listen(7777,()=>{
        console.log('server running on port 7777')
    })
}).catch(err=>console.log(err))