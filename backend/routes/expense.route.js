const express = require('express')

const router = express.Router()

const expenseController = require('../controller/expense.controller')

router.post('/',expenseController.addExpense)

router.get('/',expenseController.getExpenses)

router.get('/:id',expenseController.getExpenseByid)

router.put('/update/:id',expenseController.editExpense)

router.delete('/delete/:id',expenseController.deleteExpense)


module.exports = router