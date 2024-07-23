

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
          const response = await fetch(`/create-order?userId=${userId}`);

          if (!response.ok) {
              throw new Error('Network response was not ok');
          }

          const orderData = await response.json();
        //   alert(JSON.stringify(orderData));

          if (!orderData.order_id) {
              Swal.fire({
                  icon: "error",
                  title: "Payment Error",
                  text: "Could not initiate payment. Please try again.",
              });
              return;
          }

          console.log(orderData.razorpay_payment_id);
          console.log('orderData', orderData);

          const options = {
              key: orderData.key_id,
              amount: orderData.amount,
              currency: "INR",
              name: "Your Company Name",
              description: "Test Transaction",
              order_id: orderData.order_id,
              handler: function (response) {
                  console.log(response);
                  console.log(response.razorpay_payment_id);

                  // Uncomment and complete this section if you need to verify the payment server-side
                  
                  const data = {
                      orderCreationId: orderData.order_id,
                      razorpayPaymentId: response.razorpay_payment_id,
                      razorpayOrderId: response.razorpay_order_id,
                      razorpaySignature: response.razorpay_signature,
                      userId: userId,
                       firstName : document.getElementById("firstName").value,
                       address : document.getElementById("address").value,
                       city : document.getElementById("city").value,
                       landmark: document.getElementById("landMark").value,
                       pincode : document.getElementById("pinCode").value,
                       phone : document.getElementById("phone").value,
                       email : document.getElementById("email").value,
                       paymentMethod : document.getElementById("paymentMethod").value

                  };
            //    alert(data.orderCreationId)
                  fetch("/verify-payment", {
                      method: "POST",
                      headers: {
                          "Content-Type": "application/json",
                      },
                      body: JSON.stringify(data),
                  })
                  .then(result => result.json())
                  .then(resultData => {
                      if (resultData.success) {
                          // Swal.fire("Payment Successful!");
                          setTimeout(() => {
                              window.location.href = `/tracking-order?orderId=${resultData.orderId}`;
                          }, 1000);
                      } else {
                          Swal.fire({
                              icon: "error",
                              title: "Payment Failed",
                              text: "Payment verification failed. Please try again.",
                          });
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

          const paymentObject = new Razorpay(options);
          paymentObject.open();

      } catch (error) {
          console.error("Error starting Razorpay payment:", error);
      }
  }
