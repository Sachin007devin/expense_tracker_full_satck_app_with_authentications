const cashfreeService = require('../services/cashfree.services')
const centralHandler = require('../utils/central.handler')
const paymentModel = require('../models/payment.model')

const createOrder = async (req, res) => {
    try {
        const { orderId, orderAmount, customerPhone } = req.body
        const customerId = req.user.id

        const response = await cashfreeService.createOrder(
            orderId,
            orderAmount,
            'INR',
            customerId,
            customerPhone
        )

        await paymentModel.create({
            orderId,
            userId: req.user.id,
            amount: orderAmount,
            status: 'PENDING'
        })

        res.json({
            success: true,
            paymentSessionId: response.payment_session_id,
            orderId: orderId
        });
    } catch (error) {
        const err = {
            statusCode: 500,
            error: error.message,
            message: 'Order creation failed'
        }
        console.log(error)
        centralHandler.errorResponse(res, err)
    }
}

const verifyPayment = async (req, res) => {
    try {
        const { orderId } = req.params;

        // 1. Cashfree se Payment Status Fetch Karein
        const response = await cashfreeService.verifyOrder(orderId);
        console.log('Payment Verification Data:', response);

        const paymentStatus = response.order_status; // 'PAID', 'FAILED', 'PENDING'

        // 2. Database Status Update Karein (Webhook na aane par bhi DB update ho jayega)
        if (paymentStatus === 'PAID') {
            await paymentModel.update(
                { status: 'SUCCESS' }, // Ya 'PAID' aapke DB schema ke according
                { where: { orderId: orderId } }
            );
        } else {
            await paymentModel.update(
                { status: paymentStatus },
                { where: { orderId: orderId } }
            );
        }

        // 3. User ko Direct `expense.html` Page par Redirect Kar Dein
        // Query param se status bhej rahe hain taaki frontend par Success/Failure msg dikha sako
        return res.redirect(`http://127.0.0.1:5500/frontend/expense.html?order_id=${orderId}&status=${paymentStatus}`);
    } catch (error) {
        console.log(error)
        return res.redirect(`http://127.0.0.1:5500/frontend/expense.html?status=FAILED`);
    }
}

// yeh hook tbhi chelga jb production main honge hum kyuki abhi privarte network hauji hamara toh simple cashfree communicate nhi kr payega jis wjh se verify payment main manuaaly deal kiya hai humne iss chiz ko
const handleWebhook = async (req, res) => {
    try {
        console.log('Webhook payload:', req.body);

        const { order_id, payment_status, transaction_id } = req.body;
        payment_status = payment_status === 'PAID' ? "SUCCESS" : "FAILED"

        // Update your DB
        await paymentModel.update(
            { status: payment_status, transactionId: transaction_id },
            { where: { orderId:order_id } }
        );

        res.status(200).send('Webhook received');
    } catch (error) {
        res.status(500).send('Webhook handling failed');
    }
};


module.exports = {
    createOrder,
    verifyPayment,
    handleWebhook
}