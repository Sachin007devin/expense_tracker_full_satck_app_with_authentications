

document.getElementById("premium_btn").addEventListener("click", async () => {
  try {
    const orderId = "order_" + Date.now(); // unique order ID
    const orderAmount = 500; // example premium amount
    const customerPhone = "9876543210"; // can be dynamic

   
    const data = await axios.post(`${BASE_URL}/payments/create-order`, {
      orderId, orderAmount, customerPhone  
    },{headers :{'Authorization':token}} )

    if (!data.success) throw new Error("Order creation failed");

    const cashfree = new Cashfree({ mode: "sandbox" }); // use "production" later
    cashfree.checkout({
      paymentSessionId: data.paymentSessionId,
      redirectTarget: "_self"
    });
  } catch (error) {
    alert("Payment failed: " + error.message);
  }
});




