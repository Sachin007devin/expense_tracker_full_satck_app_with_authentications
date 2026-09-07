const { Cashfree, CFEnvironment } =  require('cashfree-pg')

const cashfree = new Cashfree(CFEnvironment.SANDBOX, "TEST430329ae80e0f32e41a393d78b923034", "TESTaf195616268bd6202eeb3bf8dc458956e7192a85");

const createOrder = async (
    orderId,
    orderAmount,
    orderCurrency = 'INR',
    customerId,
    customerPhone
) => {
    try {

        const expiryDate = new Date(Date.now() +  60 * 60 * 1000)
        const formattedExpiryDate = expiryDate.toISOString()

        const request = {
            "order_amount": orderAmount,//1
            "order_currency": orderCurrency,// inr
            "order_id": orderId,//"devstudio_7501832258734100883"
            "customer_details": {
                "customer_id": customerId.toString(),//"devstudio_user",
                "customer_phone": customerPhone//"9876543210"
            },
            "order_meta": {
                // "return_url": "https://www.cashfree.com/devstudio/preview/pg/web/popupCheckout?order_id={order_id}"
                "return_url":`http://localhost:7777/payments/payment-status/${orderId}`,
                "payment_methods": "cc,dc,upi"
            },
            "order_expiry_time": formattedExpiryDate//"2026-09-06T03:13:27.379Z"
        };

        const response = await cashfree.PGCreateOrder(request)
        return response.data
    } catch (error) {
      console.error('Error:', error?.response?.data?.message || error.message);
      throw Error(error)
    }
}

const verifyOrder = async (orderId) => {
    try {
        const response = await cashfree.PGFetchOrder(orderId);
        return response.data;
    } catch (error) {
        console.error('Error in PGFetchOrder:', error?.response?.data?.message || error.message);
        throw error;
    }
};
module.exports = {
    createOrder,
    verifyOrder
}