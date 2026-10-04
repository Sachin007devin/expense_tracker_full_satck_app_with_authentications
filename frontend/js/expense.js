document.addEventListener('DOMContentLoaded', async () => initialize())
const form = document.querySelector('form')

const API_URL = 'http://65.0.122.121:7777/expense'
const BASE_URL = 'http://65.0.122.121:7777'
const token = localStorage.getItem('token')
const rows_number = document.getElementById('select_number_of_rows')

if (!localStorage.getItem('display_expense_number_preference')) localStorage.setItem('display_expense_number_preference', JSON.stringify(5))
else {
    rows_number.value = JSON.parse(localStorage.getItem('display_expense_number_preference'))
}

rows_number.onchange = async () => {
    try {
        localStorage.setItem('display_expense_number_preference', JSON.stringify(rows_number.value))
        getPageData(1)
    } catch (error) {
        window.alert()
    }


}

if (form) {
    form.addEventListener('submit', async (event) => handleSubmit(event))
}


async function initialize() {
    try {
        const page = 1
        const rows_limit = Number(JSON.parse(localStorage.getItem('display_expense_number_preference')))
        const getExpenseByPage = await axios.get(`${API_URL}?pageNumber=${page}&rows_limit=${rows_limit}`, { headers: { 'Authorization': token } })

        const { expenses, ...pageData } = getExpenseByPage.data.data
        for (let expenseObj of expenses) {
            display(expenseObj)
        }
        displayPagination(pageData)

        // premium_user calls and logic

        const { data } = await axios.get(`${BASE_URL}/payments/premium-status`, { headers: { 'Authorization': token } })
        console.log(data.data.isPremiumUser, '<<<<<premium user data')

        const isPremiumUser = data.data.isPremiumUser

        if (isPremiumUser) {
            const leaderBoard_data_response = await axios.get(`${BASE_URL}/premium/LeaderBoard`, { headers: { 'Authorization': token } })


            const leaderBoard_data = leaderBoard_data_response.data.data  // 2d array


            display_leaderBoard(leaderBoard_data)
            const premium_user_feature = document.querySelector('#premium_user_feature')

            premium_user_feature.style.display = 'block'

            const income_btn = document.getElementById('income_btn')

            if (income_btn) income_btn.disabled = false

            // show list of file download before
            //=> make api call,show table with anchor tag , that links hould be downloadable links
            const fileurl_response = await axios.get(`${API_URL}/downloaded/files`, { headers: { 'Authorization': token } })

            const fileUrls = fileurl_response.data.data
            displayDownloadedFileTable(fileUrls)
        }

    } catch (error) {
        throw Error(error)
    }
}

async function handleSubmit(event) {
    event.preventDefault()

    const expns_btn = document.getElementById('expns_btn')
    expns_btn.disabled = true

    const expense_amount = event.target.expense_amount.value
    const expense_description = event.target.expense_description.value

    const obj = {
        expense_amount,
        expense_description,
        IsIncome: 'false'
    }


    const updateId = JSON.parse(sessionStorage.getItem('id'))

    try {
        if (!updateId) {
            await addData(obj)
        }
        else {

            const updatedData = await axios.put(`${API_URL}/update/${updateId}`, obj, { headers: { 'Authorization': token } })
            const updatedDataResponse = updatedData.data.data

            sessionStorage.removeItem('id')

            const li = document.getElementById(updateId)
            li.remove()

            display(updatedDataResponse)

            const expns_btn = document.getElementById('expns_btn')
            expns_btn.firstChild.data = 'Add Expense'
        }
    } catch (error) {
        console.error('Error submitting expense:', error)
        alert(error.response?.data?.message || 'Something went wrong!')
    }
    finally {
        if (expns_btn) expns_btn.disabled = false
        form.reset()
        const income_btn = document.getElementById('income_btn')
        if (income_btn) income_btn.disabled = false
    }
}

async function addData(expnseObj) {
    try {

        const { data } = await axios.post(`${API_URL}`, expnseObj, { headers: { 'Authorization': token } })
        console.log(data.data, 'from add')
        const dataResponse = data.data
        display(dataResponse)

        const ul = document.querySelector('ul')
        if (ul) {
            console.log('entered ul check for pagination stuff')
            const total_expense_count = ul.childElementCount
            const rows_limit = Number(JSON.parse(localStorage.getItem('display_expense_number_preference')))

            if (total_expense_count > rows_limit) await getPageData(1)
        }
    } catch (error) {
        alert(error.response?.data?.message || 'Something went wrong!')
        throw Error(error)
    }
}

function display(data) {
    const ul = document.querySelector('ul')
    const li = document.createElement('li')
    li.id = data.id
    li.textContent = `${data.Amount} - ${data.Description} - ${data.Category}`
    ul.appendChild(li)

    const delete_btn = document.createElement('button')
    delete_btn.textContent = 'Delete'
    delete_btn.classList.add('delete_expns')
    delete_btn.addEventListener('click', async () => deletData(data.id))

    li.appendChild(delete_btn)

    if (data.IsIncome === 'false') {
        const edit_btn = document.createElement('button')
        edit_btn.textContent = 'Edit'
        edit_btn.classList.add('edit_expns')
        edit_btn.addEventListener('click', async () => editData(data.id))

        li.appendChild(edit_btn)
    }
}

async function deletData(id) {
    try {

        const li = document.getElementById(id)
        await axios.delete(`${API_URL}/delete/${id}`, { headers: { 'Authorization': token } })
        li.remove()
        await getPageData(1)
    } catch (error) {
        alert(error.response?.data?.message || 'Something went wrong!')
        throw Error(error)
    }
}

async function editData(id) {
    const income_btn = document.getElementById('income_btn')
    if (income_btn) income_btn.disabled = true
    const expense_details = await axios.get(`${API_URL}/${id}`, { headers: { 'Authorization': token } })
    const expense_details_response = expense_details.data.data

    const expense_amount = document.getElementById('expense_amount')
    const expense_description = document.getElementById('expense_description')

    expense_amount.value = expense_details_response.Amount
    expense_description.value = expense_details_response.Description

    sessionStorage.setItem('id', JSON.stringify(id))
    const expns_btn = document.getElementById('expns_btn')
    expns_btn.firstChild.data = 'Update Expense'

}

function display_leaderBoard(data) {


    const leaderBoard_ul = document.querySelector('#leaderBoard_ul')

    for (let memberDetail of data) {
        const leaderBoardMember = document.createElement('li')
        leaderBoardMember.innerText = `${memberDetail.Username} With Expense Amount ${((memberDetail.total_expense != null ? memberDetail.total_expense : 0))}`
        leaderBoard_ul.append(leaderBoardMember)
    }
}

async function getPageData(page) {
    try {
        const rows_limit = Number(JSON.parse(localStorage.getItem('display_expense_number_preference')))

        const getExpenseByPage = await axios.get(`${API_URL}?pageNumber=${page}&rows_limit=${rows_limit}`, { headers: { 'Authorization': token } })

        const expense_ul = document.querySelector('ul')
        expense_ul.innerHTML = ''

        const { expenses, ...pageData } = getExpenseByPage.data.data
        for (let expenseObj of expenses) {
            display(expenseObj)
        }
        displayPagination(pageData)

    } catch (error) {
        alert(error.response?.data?.message || 'Something went wrong!')
        throw Error(error)
    }
}


function displayPagination(pageData) {

    const previous_page_btn = document.getElementById('previous_page')
    const current_page_btn = document.getElementById('current_page')
    const next_page_btn = document.getElementById('next_page')

    if (pageData.hasNextPage || pageData.hasPreviousPage) current_page_btn.style.display = 'block'
    current_page_btn.innerText = pageData.currentPageVal

    if (!pageData.hasPreviousPage) {
        previous_page_btn.style.display = 'none'
    }
    if (!pageData.hasNextPage) {
        next_page_btn.style.display = 'none'
    }

    if (pageData.hasPreviousPage) {
        previous_page_btn.style.display = 'block'
        previous_page_btn.innerText = pageData.previousPageVal
        previous_page_btn.onclick = () => getPageData(Number(pageData.previousPageVal))
    }
    if (pageData.hasNextPage) {
        next_page_btn.style.display = 'block'
        next_page_btn.innerText = pageData.nextPageVal
        next_page_btn.onclick = () => getPageData(Number(pageData.nextPageVal))
    }

}

function displayDownloadedFileTable(urls) {
    const list = document.getElementById("download_list");

    list.innerHTML = ""; // clear old list

    urls.forEach(urlobj => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = urlobj.url;
        console.log('url for file', urlobj)
        a.textContent = urlobj.url.split("/").pop(); // show filename
        a.target = "_blank"; // open in new tab
        a.download = "myexpense.csv";     // trigger download
        li.appendChild(a);
        list.appendChild(li);
    });
    const download_section = document.querySelector('.download_section')
    download_section.style.display = 'block'
}

// premium btn logic

document.getElementById("premium_btn").addEventListener("click", async () => {
    try {
        const orderId = "order_" + Date.now();
        const orderAmount = 500;
        const customerPhone = "9876543210";


        const { data } = await axios.post(`${BASE_URL}/payments/create-order`, {
            orderId, orderAmount, customerPhone
        }, { headers: { 'Authorization': token } })

        console.log(data)
        if (!data.success) throw new Error("Order creation failed");

        const cashfree = Cashfree({
            mode: "sandbox"
        })
        const result = await cashfree.checkout({
            paymentSessionId: data.paymentSessionId,
            redirectTarget: "_self"
        });
        if (result.error) {
            console.log("User closed or payment failed:", result.error);
            window.location.href = `http://127.0.0.1:5500/frontend/expense.html?status=FAILED`
        }
    } catch (error) {
        alert("Payment failed: " + error.message);
    }
});

// show leaderBoard btn Logic
document.getElementById('show_leaderBoard').addEventListener('click', () => {
    const leaderBoard = document.querySelector('.leaderBoard')

    if (leaderBoard.style.display === 'none' || leaderBoard.style.display === null) {
        leaderBoard.style.display = 'block'
    }
    else {
        leaderBoard.style.display = 'none'
    }
})

// generate report logic
document.getElementById('generate_report').addEventListener('click', () => {
    window.location.href = 'report.html'
})

// income btn logic
document.getElementById('income_btn').onclick = async () => {
    try {
        const expense_amount = document.getElementById('expense_amount').value
        const expense_description = document.getElementById('expense_description').value

        const obj = {
            expense_amount,
            expense_description,
            IsIncome: 'true'
        }

        await addData(obj)
        form.reset()
    } catch (error) {

    }
}

