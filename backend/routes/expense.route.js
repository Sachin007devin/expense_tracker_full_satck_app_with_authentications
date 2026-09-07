const express = require('express')

const router = express.Router()

const expenseController = require('../controller/expense.controller')
const authentication = require('../middleware/authenticate')

router.post('/',authentication.authenticate,expenseController.addExpense)

router.get('/',authentication.authenticate,expenseController.getExpenses)

router.get('/:id',authentication.authenticate,expenseController.getExpenseByid)

router.put('/update/:id',authentication.authenticate,expenseController.editExpense)

router.delete('/delete/:id',authentication.authenticate,expenseController.deleteExpense)


module.exports = router