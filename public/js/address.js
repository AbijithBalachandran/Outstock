document.addEventListener('DOMContentLoaded', (event) => {
      const form = document.getElementById('addaddressForm');

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
                 
                  errors.push({ field: 'username', message: 'Please enter a valid name or phrase.' });
            }
            if (!formData.get('phone') || !mobileRegex.test(formData.get('phone'))) {
                  errors.push({ field: 'userphone', message: 'Please enter a valid Indian mobile number.' });
            }
            if (!formData.get('location') || !locationRegex.test(formData.get('location'))) {
                  errors.push({ field: 'userlocation', message: "Please enter a valid input." });
            }
            if (!formData.get('pincode') || !pincodeRegex.test(formData.get('pincode'))) {
                  errors.push({ field: 'userpincode', message: "Please enter a valid 6-digit Indian PIN code." });
            }
            if (!formData.get('address') || !addressRegex.test(formData.get('address'))) {
                  errors.push({ field: 'useraddress', message: "Please enter a valid address component." });
            }
            if (!formData.get('city') || !cityNameRegex.test(formData.get('city'))) {
                  errors.push({ field: 'usercity', message: "Please enter a valid input." });
            }
            if (!formData.get('landmark') || !landmarkNameRegex.test(formData.get('landmark'))) {
                  errors.push({ field: 'userlandmark', message: "Please enter a valid input." });
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

      form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(form);
            const validationErrors = validateForm(formData);
            console.log('form Data' + formData);
            if (validationErrors.length > 0) {
                  displayErrors(validationErrors);
                  return;
            }

            // Convert FormData to JSON object
            const jsonObject = {};
            formData.forEach((value, key) => {
                  jsonObject[key] = value;
            });
            const userId = document.getElementById("submit-btn").getAttribute("data-user-id");

            try {
                  const response = await fetch(`/manage-address?id=${userId}`, {
                        method: 'POST',
                        headers: {
                              'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(jsonObject)
                  });

                  if (!response.ok) {
                        const errorText = await response.json();
                        displayErrors([{ field: 'form', message: errorText }]);
                  } else {
                        window.location.href = `/manage-address?id=${userId}`; // Redirect on success
                  }
            } catch (error) {
                  displayErrors([{ field: 'form', message: 'An error occurred while submitting the form.' }]);
            }
      });
});

 