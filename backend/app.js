const express = require('express')
const app = express()
const cors = require('cors')

// db connection
const db = require('./utils/db.connection')

//models
require('./models')

//routes
const userRouter = require('./routes/user.routes')
const expenseRouter = require('./routes/expense.route')
const paymentRouter = require('./routes/payment.routes')

//middleware
app.use(cors({
    origin: '*'
}))
app.use(express.json())
app.use('/users', userRouter)
app.use('/expense', expenseRouter)
app.use('/payments', paymentRouter)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' })
})

db.sync({ alter: true }).then(() => {
    app.listen(7777, () => {
        console.log('server running on port 7777')
    })
}).catch(err => console.log(err))