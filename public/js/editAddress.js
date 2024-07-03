
document.addEventListener('DOMContentLoaded', (event) => {
      const form = document.getElementById('editAddressForm');
    
      function validateForm(formData) {
        const errors = [];
        const nameRegex = /^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/;
        const addressRegex = /^[a-zA-Z0-9\s,'-\/#().]+$/;
        const mobileRegex = /^(\+91[-\s]?)?[6-9]\d{9}$/;
        const locationRegex = /^[a-zA-Z0-9\s,'.\-]+$/;
        const pincodeRegex = /^[1-9][0-9]{5}$/;
        const cityNameRegex = /^[a-zA-Z\s.'-]+$/;
        const landmarkNameRegex = /^[a-zA-Z0-9\s.'-]+$/;
    
        if (!formData.get('name') || !nameRegex.test(formData.get('name'))) {
          errors.push({ field: 'name', message: 'Please enter a valid name.' });
        }
        if (!formData.get('phone') || !mobileRegex.test(formData.get('phone'))) {
          errors.push({ field: 'phone', message: 'Please enter a valid Indian mobile number.' });
        }
        if (!formData.get('location') || !locationRegex.test(formData.get('location'))) {
          errors.push({ field: 'location', message: 'Please enter a valid location.' });
        }
        if (!formData.get('pincode') || !pincodeRegex.test(formData.get('pincode'))) {
          errors.push({ field: 'pincode', message: 'Please enter a valid PIN code.' });
        }
        if (!formData.get('address') || !addressRegex.test(formData.get('address'))) {
          errors.push({ field: 'address', message: 'Please enter a valid address.' });
        }
        if (!formData.get('city') || !cityNameRegex.test(formData.get('city'))) {
          errors.push({ field: 'city', message: 'Please enter a valid city.' });
        }
        if (!formData.get('landmark') || !landmarkNameRegex.test(formData.get('landmark'))) {
          errors.push({ field: 'landmark', message: 'Please enter a valid landmark.' });
        }
    
        return errors;
      }
    
      function displayErrors(errors) {
        clearErrors();
        errors.forEach(error => {
          const errorElement = document.getElementById(`${error.field}-error`);
          if (errorElement) {
            errorElement.textContent = error.message;
          }
        });
      }
    
      function clearErrors() {
        const errorElements = document.querySelectorAll('.error');
        errorElements.forEach(element => {
          element.textContent = '';
        });
      }
    
      document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', (event) => {
          const address = JSON.parse(button.getAttribute('data-address'));
          populateEditForm(address);
        });
      });
    
      function populateEditForm(address) {
        document.getElementById('id').value = address._id;
        document.getElementById('name').value = address.name;
        document.getElementById('phone').value = address.phone;
        document.getElementById('location').value = address.location;
        document.getElementById('pincode').value = address.pincode;
        document.getElementById('address').value = address.address;
        document.getElementById('city').value = address.city;
        document.getElementById('landmark').value = address.landmark;
      }
    
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        const validationErrors = validateForm(formData);
        if (validationErrors.length > 0) {
          displayErrors(validationErrors);
          return;
        }
        const jsonObject = {};
        formData.forEach((value, key) => {
          jsonObject[key] = value;
        });
        const userId = document.getElementById("submit-btn").getAttribute("data-user-id");
    
        try {
          const response = await fetch(`/manage-address?id=${userId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(jsonObject)
          });
    
          if (!response.ok) {
            const errorText = await response.json();
            displayErrors([{ field: 'form', message: errorText }]);
          } else {
            window.location.href = `/manage-address?id=${userId}`;
          }
        } catch (error) {
          displayErrors([{ field: 'form', message: 'An error occurred while submitting the form.' }]);
        }
      });
    });
    