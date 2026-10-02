const form = document.querySelector('form')

if (form) {
    form.addEventListener('submit', async (event) => handleFormSubmit(event))
}
const urlParams = new URLSearchParams(window.location.search)
const requestId = urlParams.get('request_id')
console.log('request_id', requestId)

const PASSWORD_API_URL = 'http://localhost:7777/password'

async function handleFormSubmit(event) {
    try {

        const reset_pass_btn = document.getElementById('reset_pass_btn')
        reset_pass_btn.disabled = true
        event.preventDefault()

        const user_password = event.target.user_password.value
        const confirm_user_password = event.target.confirm_user_password.value


        if (user_password !== confirm_user_password) {
            window.alert('Please make sure you reEntered the correct password')
            return
        }

        const { data } = await axios.post(`${PASSWORD_API_URL}/confirmPassword/${requestId}`, { updated_password: confirm_user_password })

        if (data.success) {
            window.location.href = 'login.html'
        }
    } catch (error) {
        window.alert(error)
        throw Error(error)
    }
    finally {
        reset_pass_btn.disabled = false
    }
}