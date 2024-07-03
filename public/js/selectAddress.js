async function addressSelection(event, id) {
      event.preventDefault();
      
      try {
          const response = await fetch(`/checkout-address?id=${id}`);
          if (!response.ok) {
              throw new Error('Failed to fetch address');
          }

          const addressData = await response.json();
          updateCheckoutPage(addressData);
          $('#addressModal').modal('hide');
      } catch (error) {
          console.error('Error fetching address:', error);
      }
  }

  function updateCheckoutPage(addressData) {
      document.getElementById('firstName').value = addressData.name; // Update with actual form field IDs
      document.getElementById('phone').value = addressData.phone;
      document.getElementById('email').value = addressData.email;
      document.getElementById('address').value = addressData.address + ', ' + addressData.location + ', ' + addressData.city;
      document.getElementById('landMark').value = addressData.landmark;
      document.getElementById('pinCode').value = addressData.pincode;
      document.getElementById('city').value = addressData.city;
  }