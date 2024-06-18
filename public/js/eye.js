// const passwordField = document.getElementById("password");
// const togglePassword = document.querySelector(".password-toggle-icon i");

// togglePassword.addEventListener("click", function () {
//   if (passwordField.type === "password") {
//     passwordField.type = "text";
//     togglePassword.classList.remove("bi bi-eye-slash-fill");
//     togglePassword.classList.add("bi bi-eye-fill");
//   } else {
//     passwordField.type = "password";
//     togglePassword.classList.remove("bi bi-eye-fill");
//     togglePassword.classList.add("bi bi-eye-slash-fill");
//   }
// });


document.querySelectorAll('.password-toggle-icon').forEach(item => {
      item.addEventListener('click', function() {
          let input = this.previousElementSibling;
          if (input.type === 'password') {
              input.type = 'text';
              this.querySelector('i').classList.remove('bi-eye-slash-fill');
              this.querySelector('i').classList.add('bi-eye-fill');
          } else {
              input.type = 'password';
              this.querySelector('i').classList.remove('bi-eye-fill');
              this.querySelector('i').classList.add('bi-eye-slash-fill');
          }
      });
  });