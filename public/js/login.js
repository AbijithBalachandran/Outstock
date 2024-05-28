document.addEventListener('DOMContentLoaded', () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
   
      const registerForm = document.querySelector('#customer_login');
      const emailError = document.getElementById('invalid-Email');
      const passwordError = document.getElementById('invalid-pass');
   
      registerForm.addEventListener('submit', (event) => {
       event.preventDefault();
   
       let Email = registerForm.querySelector('#CustomerEmail').value;
       let password = registerForm.querySelector('#CustomerPassword').value;
   
       let isValid = true;
   
       // Validate Email
       if (!emailRegex.test(Email)) {
        emailError.style.display = 'inline';
        isValid = false;
       } else {
        emailError.style.display = 'none';
       }
   
       // Validate Password
       if (!passwordRegex.test(password)) {
        passwordError.style.display = 'inline';
        isValid = false;
       } else {
        passwordError.style.display = 'none';
       }
   
       // Submit the form if all fields are valid
       if (isValid) {
        registerForm.submit();
       }
      });
   });