const express = require('express')
const app = express()
const cors = require('cors')

require('dotenv').config()


// const brevo = new BrevoClient({
//     apiKey: process.env.SENDINBLUE_API_KEY
// })

// async function sendEmail() {

//     try {

//         const result = await brevo.transactionalEmails.sendTransacEmail({

//             sender: {
//                 email: 'rustystrtdx@gmail.com',
//                 name: 'Expense Tracker'
//             },

//             to: [
//                 {
//                     email: 'sachingamerz0805@gmail.com'
//                 }
//             ],

//             subject: 'Password Reset Request',

//             textContent:
//                 'Here is the link for resetting your password.',

//             htmlContent:
//                 '<h3>Password Reset Request</h3>' +
//                 '<p>Click here to reset your password.</p>'
//         })

//         console.log('Email sent successfully!')
//         console.log(result)

//     } catch (error) {

//         console.error('Brevo API Error:')
//         console.error(error)

//     }
// }

// sendEmail()
    


// db connection
const db = require('./utils/db.connection')

//models
require('./models')

//routes
const userRouter = require('./routes/user.routes')
const expenseRouter = require('./routes/expense.route')
const paymentRouter = require('./routes/payment.routes')
const premiumRouter = require('./routes/premium.routes')
const passwordRouter = require('./routes/password.routes')

//middleware
app.use(cors({
    origin: [process.env.ALLOWED_DOMAIN],
    credentials:true
}))
app.use(express.json())
app.use('/users', userRouter)
app.use('/expense', expenseRouter)
app.use('/payments', paymentRouter)
app.use('/premium' , premiumRouter)
app.use('/password',passwordRouter)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' })
})

db.sync().then(() => {
    app.listen(7777, () => {
        console.log('server running on port 7777')
    })
}).catch(err => console.log(err))

