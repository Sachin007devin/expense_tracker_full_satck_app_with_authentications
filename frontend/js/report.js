const EXPENSE_DOWNLOAD_URL = 'http://65.0.122.121:7777/expense/download';
const token = localStorage.getItem('token');
const API_URL = 'http://65.0.122.121:7777/expense/reportData';

const date_filter = document.getElementById('date_filter');

date_filter.onchange = async () => {
    try {
        const timeFilter = date_filter.value;
        await displayReport(timeFilter);
    } catch (error) {
        alert(error.message || 'Something went wrong!');
        throw Error(error);
    }
}

function createReportTable(data) {
    // Target wrapper container instead of document.body directly
    const wrapper = document.getElementById('report_content_wrapper');
    wrapper.innerHTML = ''; // Clear old table & summary

    const tableWrapper = document.createElement('div');
    tableWrapper.className = 'table_responsive';

    const table = document.createElement('table');
    table.className = 'neo_table';

    let totalIncome = 0;
    let totalExpense = 0;

    const headers = ['Date', 'Description', 'Category', 'Income', 'Expense'];
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    headers.forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');

    if (data.length === 0) {
        const emptyTr = document.createElement('tr');
        const emptyTd = document.createElement('td');
        emptyTd.colSpan = 5;
        emptyTd.className = 'empty_table_msg';
        emptyTd.textContent = 'No transaction records found for this period.';
        emptyTr.appendChild(emptyTd);
        tbody.appendChild(emptyTr);
    } else {
        data.forEach((row) => {
            const tr = document.createElement('tr');
            const dateTime = row.createdAt;
            const date = dateTime ? new Date(dateTime).toISOString().split("T")[0] : 'N/A';
            const income = row.IsIncome === "false" ? "-" : String(row.Amount);
            const expense = row.IsIncome === 'false' ? String(row.Amount) : '-';

            const dataRow = {
                date,
                description: row.Description,
                category: row.Category,
                income,
                expense
            };

            totalIncome = totalIncome + (income === "-" ? 0 : Number(income));
            totalExpense = totalExpense + (expense === "-" ? 0 : Number(expense));

            let colIndex = 0;
            Object.values(dataRow).forEach(val => {
                const td = document.createElement('td');
                td.textContent = val;

                // Add conditional styling classes for income/expense columns
                if (colIndex === 3 && val !== "-") {
                    td.className = 'amount_pos';
                    td.textContent = `+₹${val}`;
                } else if (colIndex === 4 && val !== "-") {
                    td.className = 'amount_neg';
                    td.textContent = `-₹${val}`;
                }

                tr.appendChild(td);
                colIndex++;
            });
            tbody.appendChild(tr);
        });
    }

    table.appendChild(tbody);
    tableWrapper.appendChild(table);
    wrapper.appendChild(tableWrapper);

    createSummary(totalIncome, totalExpense);
}

function createSummary(income, expense) {
    const wrapper = document.getElementById('report_content_wrapper');

    const summaryCard = document.createElement('div');
    summaryCard.className = 'summary_card';

    const savings = income - expense;

    summaryCard.innerHTML = `
        <div class="summary_item">
            <span>Total Income</span>
            <strong class="amount_pos">+₹${income.toFixed(2)}</strong>
        </div>
        <div class="summary_item">
            <span>Total Expense</span>
            <strong class="amount_neg">-₹${expense.toFixed(2)}</strong>
        </div>
        <div class="summary_item">
            <span>Net Savings</span>
            <strong class="${savings >= 0 ? 'amount_pos' : 'amount_neg'}">₹${savings.toFixed(2)}</strong>
        </div>
    `;

    wrapper.appendChild(summaryCard);
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const timeFilter = 'Today';
        console.log(timeFilter, typeof timeFilter);
        await displayReport(timeFilter);
    } catch (error) {
        alert(error.message || 'Something went wrong!');
        throw Error(error);
    }
});

async function displayReport(timeFilter) {
    try {
        const reportData = await axios.get(`${API_URL}/${timeFilter}`, { headers: { 'Authorization': token } });
        const reportData_response = reportData.data.data;
        console.log(reportData_response);

        createReportTable(reportData_response);
    } catch (error) {
        alert(error.message || 'Something went wrong!');
        throw Error(error);
    }
}

const download_report_btn = document.getElementById('download_report_btn');
download_report_btn.onclick = async () => {
    try {
        const { data } = await axios.get(EXPENSE_DOWNLOAD_URL, { headers: { 'Authorization': token } });
        const url = data.data.fileUrl;
        console.log('url of expense file==>>>>', url);

        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.download = 'myexpense.csv'; 
        
        // Append to body temporarily for Firefox compatibility
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
    } catch (error) {
        alert(error?.response?.data?.message || error?.message || 'Some internal error');
    }
};