document.addEventListener('DOMContentLoaded', async () => initialize())
const form = document.querySelector('form')

const API_URL = 'http://Localhost:7777/expense'
const BASE_URL = 'http://Localhost:7777'
const token = localStorage.getItem('token')

if (form) {
    form.addEventListener('submit', async (event) => handleSubmit(event))
}

// const isPremiumUser = false
// const leaderBoard_data = [
//     { name: 'Pranjal', Amount: 50 },
//     { name: 'Archi', Amount: 100 },
//     { name: 'Sachin', Amount: 200 }
// ]

async function initialize() {
    try {
        const getAllExpense = await axios.get(`${API_URL}`, { headers: { 'Authorization': token } })
        console.log(getAllExpense)
        console.log(getAllExpense.data.data, 'from initialize')

        const getAllExpenseData = getAllExpense.data.data
        for (let expenseObj of getAllExpenseData) {
            display(expenseObj)
        }

        // premium_user calls and logic
        //1]  api call made hogi and data receive hoga jismian premium hai ki nhi pta chlega and then uss hisaab se usmain data hoga ya nhi hoga 
        const { data } = await axios.get(`${BASE_URL}/payments/premium-status`, { headers: { 'Authorization': token } })
        console.log(data.data.isPremiumUser, '<<<<<premium user data')

        const isPremiumUser = data.data.isPremiumUser

        const leaderBoard_data_response = await axios.get(`${BASE_URL}/premium/LeaderBoard`, { headers: { 'Authorization': token } })


        const leaderBoard_data = leaderBoard_data_response.data.data  // 2d array
        console.log(leaderBoard_data, '<<<<<<<<leaderBoard_data_response')

        if (isPremiumUser) {
            const premium_user_feature = document.querySelector('#premium_user_feature')
            premium_user_feature.style.display = 'block'
            display_leaderBoard(leaderBoard_data)
        }

    } catch (error) {
        console.log(error)
        return
    }
}

async function handleSubmit(event) {
    event.preventDefault()

    const expense_amount = event.target.expense_amount.value
    const expense_description = event.target.expense_description.value
    const expense_category = event.target.expense_category.value
    // console.log(expense_amount , expense_description , expense_category)

    const obj = {
        expense_amount,
        expense_description,
        expense_category
    }


    const updateId = JSON.parse(sessionStorage.getItem('id'))

    if (!updateId) {
        await addData(obj)
    }
    else {

        const updatedData = await axios.put(`${API_URL}/update/${updateId}`, obj)
        //    console.log(updatedData.data.data[0])
        const updatedDataResponse = updatedData.data.data

        sessionStorage.removeItem('id')

        const li = document.getElementById(updateId)
        li.remove()

        display(updatedDataResponse)
    }

    form.reset()

    const expns_btn = document.getElementById('expns_btn')
    expns_btn.firstChild.data = 'Add Expense'

}

async function addData(expnseObj) {
    const { data } = await axios.post(`${API_URL}`, expnseObj, { headers: { 'Authorization': token } })
    console.log(data.data, 'from add')
    const dataResponse = data.data
    display(dataResponse)
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

    const edit_btn = document.createElement('button')
    edit_btn.textContent = 'Edit'
    edit_btn.classList.add('edit_expns')
    edit_btn.addEventListener('click', async () => editData(data.id))

    li.appendChild(edit_btn)
}

async function deletData(id) {
    const li = document.getElementById(id)
    await axios.delete(`${API_URL}/delete/${id}`, { headers: { 'Authorization': token } })
    li.remove()
}

async function editData(id) {

    const expense_details = await axios.get(`${API_URL}/${id}`)
    console.log(expense_details.data.data, 'from edit')
    const expense_details_response = expense_details.data.data

    const expense_amount = document.getElementById('expense_amount')
    const expense_description = document.getElementById('expense_description')
    const expense_category = document.getElementById('expense_category')


    expense_amount.value = expense_details_response.Amount
    expense_description.value = expense_details_response.Description
    expense_category.value = expense_details_response.Category

    sessionStorage.setItem('id', JSON.stringify(id))
    const expns_btn = document.getElementById('expns_btn')
    expns_btn.firstChild.data = 'Update Expense'

}

function display_leaderBoard(data) {


    const leaderBoard_ul = document.querySelector('#leaderBoard_ul')

    for (let memberDetail of data) {
        const leaderBoardMember = document.createElement('li')
        leaderBoardMember.innerText = `${memberDetail.Username} With Expense Amount ${(memberDetail.total_expense)}`
        leaderBoard_ul.append(leaderBoardMember)
    }
    console.log(document.querySelector('.leaderBoard'))
}

// premium btn logic

document.getElementById("premium_btn").addEventListener("click", async () => {
    try {
        const orderId = "order_" + Date.now(); // unique order ID
        const orderAmount = 500; // example premium amount
        const customerPhone = "9876543210"; // can be dynamic


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
        console.log(result, '<<<<<<<<<result')
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