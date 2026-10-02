const express = require('express')

const router = express.Router()

const expenseController = require('../controller/expense.controller')
const authentication = require('../middleware/authenticate')

router.post('/',authentication.authenticate,expenseController.addExpense)

//migrated add expense route
router.post('/migrated_expense',expenseController.addMigratedExpense)

router.get('/',authentication.authenticate,expenseController.getExpenses)

router.get('/download',authentication.authenticate,expenseController.downloadExpense)

router.get('/downloaded/files',authentication.authenticate , expenseController.getDownloadedFiles)

router.get('/reportData',authentication.authenticate,expenseController.fetchReportData)

router.get('/:id',authentication.authenticate,expenseController.getExpenseByid)


router.put('/update/:id',authentication.authenticate,expenseController.editExpense)

router.delete('/delete/:id',authentication.authenticate,expenseController.deleteExpense)


module.exports = router