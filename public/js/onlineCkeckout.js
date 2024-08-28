

function togglePaymentButton() {
    const paymentMethod = document.getElementById("paymentMethod").value;
    const submitBtn = document.getElementById("submit-btn");
    const razorpayBtn = document.getElementById("razorpay-btn");
    const walletBtn = document.getElementById("wallet-btn");

    if (paymentMethod === "Wallet") {
        walletBtn.style.display = "inline-block";
        razorpayBtn.style.display = "none";
        submitBtn.style.display = "none";
    } else if (paymentMethod === "Online") {
        walletBtn.style.display = "none";
        razorpayBtn.style.display = "inline-block";
        submitBtn.style.display = "none";
    } else {
        walletBtn.style.display = "none";
        razorpayBtn.style.display = "none";
        submitBtn.style.display = "inline-block";
    }

}



async function startRazorpayPayment() {
    const userId = document.getElementById('submit-btn').getAttribute('data-user-id');
    try {
        const data = {
            userId: userId,
            firstName: document.getElementById("firstName").value,
            address: document.getElementById("address").value,
            city: document.getElementById("city").value,
            landmark: document.getElementById("landMark").value,
            pincode: document.getElementById("pinCode").value,
            phone: document.getElementById("phone").value,
            email: document.getElementById("email").value,
            paymentMethod: document.getElementById("paymentMethod").value
        };

        const response = await fetch(`/create-order?userId=${userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data) 
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const orderData = await response.json();

        console.log('orderData', orderData);

        if (!orderData.order_id) {
            Swal.fire({
                icon: "error",
                title: "Payment Error",
                text: "Could not initiate payment. Please try again.",
            });
            return;
        }

        const options = {
            key: orderData.key_id,
            amount: orderData.amount,
            currency: "INR",
            name: "OutStock PLTD",
            description: "Test Transaction",
            order_id: orderData.order_id,
            handler: function (response) {
                const verificationData = {
                    orderCreationId: orderData.order_id,
                    razorpayPaymentId: response.razorpay_payment_id,
                    razorpayOrderId: response.razorpay_order_id,
                    razorpaySignature: response.razorpay_signature,
                    userId: userId,
                    firstName: document.getElementById("firstName").value,
                    address: document.getElementById("address").value,
                    city: document.getElementById("city").value,
                    landmark: document.getElementById("landMark").value,
                    pincode: document.getElementById("pinCode").value,
                    phone: document.getElementById("phone").value,
                    email: document.getElementById("email").value,
                    paymentMethod: document.getElementById("paymentMethod").value
                };

                fetch("/verify-payment", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(verificationData),
                })
                .then(result => result.json())
                .then(resultData => {
                    if (resultData.success) {
                        setTimeout(() => {
                            window.location.href = `/tracking-order?orderId=${resultData.orderId}`;
                        }, 1000);
                    } else {
                        Swal.fire({
                            icon: "error",
                            title: "Payment Failed",
                            text: "Payment verification failed. Please try again.",
                        })
                    }
                });
            },
            prefill: {
                name: document.getElementById('firstName').value,
                email: document.getElementById('email').value,
                contact: document.getElementById('phone').value,
            },
            notes: {
                address: document.getElementById('address').value,
            },
            theme: {
                color: "#3399cc",
            },
        };

        var paymentObject = new Razorpay(options);

        paymentObject.on('payment.failed', function(response){
            Swal.fire('Payment Failed', 'Your payment could not be processed. Please try again.', 'error')
            .then(() => {
                let orderId = orderData.orderData
                window.location.href = `/tracking-order?orderId=${orderId}`;
            });
        });
        paymentObject.open();

    } catch (error) {
        console.error("Error starting Razorpay payment:", error);
    }
}

