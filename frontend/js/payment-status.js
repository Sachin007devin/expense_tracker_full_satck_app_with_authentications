const BASE_URL = "http://localhost:7777";
const token = localStorage.getItem("token");

const urlParams = new URLSearchParams(window.location.search)

const orderId = urlParams.get('orderId')

(async () => {
 const response = await axios.get(`${BASE_URL}/payments/verify/${orderId}`, {
  headers: { Authorization: token }
});
document.getElementById("status").innerText = `Payment Status: ${response.data.status}`;

})();
