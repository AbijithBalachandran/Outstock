
function copyCouponCode(elementId) {
      const copyText = document.getElementById(elementId);
      copyText.select();
      document.execCommand("copy");
      Swal.fire("successfully copy the coupon code");
      
  }

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


// async function startWalletPayment() {

//   const userId = document.getElementById('wallet-btn').getAttribute('data-user-id');
  
//   // Define the data object with necessary details
//   const data = {
//       userId: userId,
//       firstName: document.getElementById('firstName').value,
//       address: document.getElementById('address').value,
//       landmark: document.getElementById('landMark').value,
//       city: document.getElementById('city').value,
//       phone: document.getElementById('phone').value,
//       pincode: document.getElementById('pinCode').value,
//       email: document.getElementById('email').value,
//       paymentMethod: 'Wallet'
//   };

//   try {
//       const response = await fetch("/wallet-payment", {
//           method: "POST",
//           headers: {
//               "Content-Type": "application/json",
//           },
//           body: JSON.stringify(data),
//       });

//       const resultData = await response.json();

//       if (resultData.success) {
//           Swal.fire("Payment Successful!");
//           setTimeout(() => {
//               window.location.href = `/tracking-order?orderId=${resultData.orderId}`;
//           }, 1000);
//       } else {
//           Swal.fire({
//               icon: "error",
//               title: "Payment Failed",
//               text: resultData.message || "Payment verification failed. Please try again.",
//           });
//       }
//   } catch (error) {
//       console.error("Error starting wallet payment:", error);
//   }
// }




async function startWalletPayment() {
    const userId = document.getElementById('wallet-btn').getAttribute('data-user-id');
    
    const data = {
        userId: userId,
        firstName: document.getElementById('firstName').value,
        address: document.getElementById('address').value,
        landmark: document.getElementById('landMark').value,
        city: document.getElementById('city').value,
        phone: document.getElementById('phone').value,
        pincode: document.getElementById('pinCode').value,
        email: document.getElementById('email').value,
        paymentMethod: 'Wallet'
    };

    try {
        const response = await fetch("/wallet-payment", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        const resultData = await response.json();

        if (resultData.success) {
            Swal.fire("Payment Successful!");
            setTimeout(() => {
                window.location.href = `/tracking-order?orderId=${resultData.orderId}`;
            }, 1000);
        } else {
            Swal.fire({
                icon: "error",
                title: "Payment Failed",
                text: resultData.message || "Payment verification failed. Please try again.",
            });
        }
    } catch (error) {
        console.error("Error starting wallet payment:", error);
    }
}

