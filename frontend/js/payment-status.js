const BASE_URL = "http://localhost:7777";
const token = localStorage.getItem("token");

const orderId = window.location.pathname.split("/").pop();

(async () => {
 const response = await axios.get(`${BASE_URL}/payments/verify/${orderId}`, {
  headers: { Authorization: token }
});
document.getElementById("status").innerText = `Payment Status: ${response.data.status}`;

})();
