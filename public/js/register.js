document.addEventListener('DOMContentLoaded', () => {
   const nameRegex = /^[a-zA-Z]+(([' -][a-zA-Z ])?[a-zA-Z]*)*$/;
   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

   const registerForm = document.querySelector('#create_customer');
   const FnameError = document.getElementById('invalid-Fname');
   const LnameError = document.getElementById('invalid-Lname');
   const emailError = document.getElementById('invalid-Email');
   const passwordError = document.getElementById('invalid-pass');
   const confPasswordError = document.getElementById('invalid-confirmpass');

   registerForm.addEventListener('submit', (event) => {
    event.preventDefault();

    let Fname = registerForm.querySelector('#RegisterForm-FirstName').value;
    let Lname = registerForm.querySelector('#RegisterForm-LastName').value;
    let Email = registerForm.querySelector('#RegisterForm-email').value;
    let password = registerForm.querySelector('#RegisterForm-password').value;
    let confirmPassword =registerForm.querySelector('#RegisterForm-confirm-password').value;

    let isValid = true;

    // Validate First Name
    if (!nameRegex.test(Fname)) {
     FnameError.style.display = 'inline';
     isValid = false;
    } else {
     FnameError.style.display = 'none';
    }

    // Validate Last Name
    if (!nameRegex.test(Lname)) {
     LnameError.style.display = 'inline';
     isValid = false;
    } else {
     LnameError.style.display = 'none';
    }

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
    //validate conform password
    if(confirmPassword !== password){
      confPasswordError.style.display = 'inline';
      isValid = false;
    }else{
      confPasswordError.style.display ='none';
    }

    // Submit the form if all fields are valid
    if (isValid) {
     registerForm.submit();
    }
   });
});