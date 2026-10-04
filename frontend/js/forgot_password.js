const form = document.querySelector('form')

if (form) {
    form.addEventListener('submit', async (event) => handleFormSubmit(event))
}

const PASSWORD_API_URL = 'http://65.0.122.121:7777/password'

async function handleFormSubmit(event) {
    try {

        const reset_pass_btn = document.getElementById('reset_pass_btn')
        reset_pass_btn.disabled = true
        event.preventDefault()
        const user_email = event.target.user_email.value

        const { data } = await axios.post(`${PASSWORD_API_URL}/forgotpassword`, { user_email })

        console.log(data.data)
        if (data) {
            const reset_msg = document.getElementsByClassName('reset_msg')[0]
            reset_msg.style.display = 'block'
        }


    } catch (error) {
        window.alert(error)
        throw Error(error)
    }
    finally {
        reset_pass_btn.disabled = false
    }
}