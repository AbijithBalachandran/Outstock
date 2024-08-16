

async function applyCoupon(event) {

      event.preventDefault();
      const couponCode = document.getElementById('inputField').value;
      const total = document.getElementById('total').value;
  
      try {
          const response = await fetch('/apply-coupon', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({ couponCode, total })
          });
          if (response.ok) {
              const data = await response.json();
              document.getElementById('couponDiscount').innerText = data.couponDiscount ;
              document.getElementById('grandTotal').innerText = data.discountedTotal;
              Swal.fire('Coupon applied successfully!');
              window.loca
          } else {
              const data = await response.json();
              Swal.fire(data.message);
          }
      } catch (error) {
          console.error('Error:', error);
          Swal.fire('An error occurred while applying the coupon.');
      }
  }
  