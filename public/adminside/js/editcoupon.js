document.addEventListener('DOMContentLoaded', function() {
      const form = document.getElementById('couponForm');

      form.addEventListener('submit', async function(event) {
          event.preventDefault();
               
          const codeNumber = document.getElementById('codeNumber');
          const discount = document.getElementById('couponDiscount');
          const minPurchaseAmount = document.getElementById('purchaseAmount');
          const maxRedeemableAmount = document.getElementById('redeemableAmount');
          const expiryDate = document.getElementById('expiryDate');
                 
          let isValid = true;

          const codeNumberRegex = /^[a-zA-Z0-9]{5,}$/;
          const discountRegex = /^(100|[1-9]?[0-9])$/;
          const amountRegex = /^[1-9]\d*$/;

          // Validate code number
          if (!codeNumberRegex.test(codeNumber.value)) {
              isValid = false;
              codeNumber.classList.add('is-invalid');
          } else {
              codeNumber.classList.remove('is-invalid');
          }

          // Validate discount
          if (!discountRegex.test(discount.value)) {
              isValid = false;
              discount.classList.add('is-invalid');
          } else {
              discount.classList.remove('is-invalid');
          }

          // Validate minimum purchase amount
          if (!amountRegex.test(minPurchaseAmount.value)) {
              isValid = false;
              minPurchaseAmount.classList.add('is-invalid');
          } else {
              minPurchaseAmount.classList.remove('is-invalid');
          }

          // Validate maximum redeemable amount
          if (!amountRegex.test(maxRedeemableAmount.value)) {
              isValid = false;
              maxRedeemableAmount.classList.add('is-invalid');
          } else {
              maxRedeemableAmount.classList.remove('is-invalid');
          }

          // Validate expiry date
          if (expiryDate.value === '') {
              isValid = false;
              expiryDate.classList.add('is-invalid');
          } else {
              expiryDate.classList.remove('is-invalid');
          }

          // If the form is valid, send the data using Fetch
          if (isValid) {
              const formData = {
                          id:id.value,
                  codeNumber: codeNumber.value,
                  discount: discount.value,
                  minPurchaseAmount: minPurchaseAmount.value,
                  maxRedeemableAmount: maxRedeemableAmount.value,
                  expiryDate: expiryDate.value
              };


              try {
            
                  const response = await fetch('/admin/editcoupon', {
                      method: 'PUT',
                      headers: {
                          'Content-Type': 'application/json'
                      },
                      body: JSON.stringify(formData)
                  });
              
                  if (response.ok) {
                      window.location.href = "/admin/couponManagement";
                  } else {
                      const data = await response.json();
                      alert('An error occurred: ' + data.message);
                  }
              } catch (error) {
                  console.error('Error:', error);
                  alert('An error occurred while updating the coupon.');
              }
          }
      });
  });