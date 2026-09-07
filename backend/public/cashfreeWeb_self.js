import { Cashfree } from "cashfree-pg";

const cashfree = Cashfree({
    mode: "sandbox",
});
document.getElementById("renderBtn").addEventListener("click", async () => {

    try {
        const  data  = await axios.post('http:localhost:7777/pay') // maybe data koi prop na ho aapko bus storer krna hai result ko in data constant or ho bhi skta hai toh filhal hata de rha hu

        const paymentSessionId = data.paymentSessionId

        let checkoutOptions = {
            paymentSessionId: paymentSessionId,
            redirectTarget: "_self",
        };

        await cashfree.checkout(checkoutOptions)
    } catch (error) {
        console.log('error from gateway', error)
    }
});