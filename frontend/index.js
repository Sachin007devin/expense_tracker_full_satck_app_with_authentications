const form = document.querySelector('form')

if(form){
    form.addEventListener('submit',async(event)=>handleFormSubmit(event))
}

const USER_API_URL = 'https://localhost/7777/users/signup'

async function handleFormSubmit(event) {
    try {
        
        event.preventDefault()
const user_name = event.target.user_name.value
const user_email = event.target.user_email.value
const user_password = event.target.user_password.value

console.log(user_name,user_email,user_password)

const payload = {user_name,user_email,user_password}

const {data} = await axios.post(USER_API_URL,payload)
const response = data.data
console.log(response)

    } catch (error) {
        throw Error(error)
        // will have error handler functyion which will display a custokmm error on frontwend with some style
    }
}