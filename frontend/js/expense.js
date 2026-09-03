document.addEventListener('DOMContentLoaded', async () => initialize())
const form = document.querySelector('form')

const API_URL = 'http://Localhost:7777/expense'

if(form){
    form.addEventListener('submit', async (event) => handleSubmit(event))
}

async function initialize(){
    try {
        const getAllExpense = await axios.get(`${API_URL}`)
        console.log(getAllExpense)
        console.log(getAllExpense.data.data,'from initialize')
        
        const getAllExpenseData = getAllExpense.data.data
        for(let expenseObj of getAllExpenseData){
            display(expenseObj)
        }

    } catch (error) {
        console.log(error)
        return
    }
}

async function handleSubmit(event){
    event.preventDefault()
    
const expense_amount = event.target.expense_amount.value
const expense_description = event.target.expense_description.value
const expense_category = event.target.expense_category.value
// console.log(expense_amount , expense_description , expense_category)

const obj={expense_amount,
  expense_description,
    expense_category
}


const updateId = JSON.parse(sessionStorage.getItem('id'))

if(!updateId){
    await addData(obj)
}
else{

   const updatedData =  await axios.put(`${API_URL}/update/${updateId}`,obj)
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

async function addData(expnseObj){
    const {data} =  await axios.post(`${API_URL}`,expnseObj)
   console.log(data.data.data,'from add')
   const dataResponse = data.data
    display(dataResponse)
}

function display(data){
    const ul = document.querySelector('ul')
    const li = document.createElement('li')
    li.id = data.id
    li.textContent = `${data.Amount} - ${data.Description} - ${data.Category}`
    ul.appendChild(li)

    const delete_btn = document.createElement('button')
    delete_btn.textContent = 'Delete'
    delete_btn.addEventListener('click',async () => deletData(data.id))

    li.appendChild(delete_btn)

    const edit_btn = document.createElement('button')
    edit_btn.textContent = 'Edit'
    edit_btn.addEventListener('click',async () => editData(data.id))

    li.appendChild(edit_btn)
}

async function deletData(id){
    const li = document.getElementById(id)
    await axios.delete(`${API_URL}/delete/${id}`)
    li.remove()
}

async function editData(id){
    
    const expense_details = await axios.get(`${API_URL}/${id}`)
    console.log(expense_details.data.data,'from edit')
   const expense_details_response = expense_details.data.data

    const expense_amount = document.getElementById('expense_amount')
    const expense_description = document.getElementById('expense_description')
    const expense_category = document.getElementById('expense_category')
    
    
            expense_amount.value = expense_details_response.Amount
            expense_description.value = expense_details_response.Description
            expense_category.value = expense_details_response.Category
        
sessionStorage.setItem('id',JSON.stringify(id))
const expns_btn = document.getElementById('expns_btn')
expns_btn.firstChild.data = 'Update Expense'

}