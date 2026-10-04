const EXPENSE_DOWNLOAD_URL = 'http://65.0.122.121:7777/expense/download'
const token = localStorage.getItem('token')
const API_URL = 'http://65.0.122.121:7777/expense/reportData'


const reportData = [
    { date: '01-09-2026', description: 'Milk', category: 'Groceries', income: '-', expense: '60.00' },
    { date: '02-09-2026', description: 'Salary', category: 'Income', income: '40,000.00', expense: '-' },
    { date: '03-09-2026', description: 'Travel', category: 'Transport', income: '-', expense: '500.00' }
]

function createReportTable(data) {
    const table = document.createElement('table')

    let totalIncome = 0
    let totalExpense = 0

    const headers = ['Date', 'Description', 'Category', 'Income', 'Expense']
    const thead = document.createElement('thead')
    const headerRow = document.createElement('tr')

    headers.forEach(text => {
        const th = document.createElement('th')
        th.textContent = text
        headerRow.appendChild(th)
    })

    thead.appendChild(headerRow)
    table.appendChild(thead)

    const tbody = document.createElement('tbody')
    data.forEach((row) => {
        const tr = document.createElement('tr')
        const dateTime = row.createdAt
        const date = new Date(dateTime).toISOString().split("T")[0]
        const income = row.IsIncome === "false" ? "-" : String(row.Amount)
        const expense = row.IsIncome === 'false' ? String(row.Amount) : '-'

        const dataRow = {
            date,
            description: row.Description,
            category: row.Category,
            income,
            expense
        }


        totalIncome = totalIncome + (income === "-" ? 0 : Number(income))
        totalExpense = totalExpense + (expense === "-" ? 0 : Number(expense))

        Object.values(dataRow).forEach(val => {
            const td = document.createElement('td')
            td.textContent = val
            tr.appendChild(td)
        })
        tbody.appendChild(tr)
    })
    table.appendChild(tbody)
    document.body.appendChild(table)

    createSummary(totalIncome, totalExpense);
}

function createSummary(income, expense) {
    const summary = document.createElement('div');
    summary.classList.add('summary')
    summary.textContent = `Total Income: ₹${income} | Total Expense: ₹${expense} | Savings: ₹${income - expense}`;
    document.body.appendChild(summary);
}

document.addEventListener('DOMContentLoaded', async () => {
    // api call for getting report data
    try {
        const reportData = await axios.get(`${API_URL}`, { headers: { 'Authorization': token } })
        const reportData_response = reportData.data.data
        console.log(reportData_response)
        createReportTable(reportData_response);
        // createReportTable(reportData)
    } catch (error) {
        alert(error.message || 'Something went wrong!')
        throw Error(error)
    }

})

const download_report_btn = document.getElementById('download_report_btn')
download_report_btn.onclick = async () => {
    try {
        const { data } = await axios.get(EXPENSE_DOWNLOAD_URL, { headers: { 'Authorization': token } })
        const url = data.data.fileUrl
        console.log('url of expense file==>>>>', url)

        const a = document.createElement('a')
        a.href = url
        a.target = '_blank'
        a.download = 'myexpense.csv'
        a.click()
    } catch (error) {
        alert(error?.message || 'Some internal error')
    }
}