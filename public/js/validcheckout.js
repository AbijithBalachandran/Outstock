
const validateForm = () => {
      const name = document.getElementById("firstName").value;
      const address = document.getElementById("address").value;
      const city = document.getElementById("city").value;
    
      const pincode = document.getElementById("pinCode").value;
      const mobile = document.getElementById("phone").value;
      const email = document.getElementById("email").value;


      // Regex patterns for validation
      const nameRegex = /^[A-Za-z ]+$/; // Only letters and spaces
      const addressRegex = /^[a-zA-Z0-9\s,'-\/#().]+$/; // Alphanumeric with specific characters
      const cityRegex = /^[A-Za-z ]+$/; // Only letters and spaces
      const pincodeRegex = /^\d{6}$/; // Five-digit numeric pincode
      const mobileRegex = /^\d{10}$/; // Ten-digit numeric mobile number
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Valid email format

      // Validate each field against its corresponding regex pattern
      const isValidName = nameRegex.test(name);
      const isValidAddress = addressRegex.test(address);
      const isValidCity = cityRegex.test(city);
    
      const isValidPincode = pincodeRegex.test(pincode);
      const isValidMobile = mobileRegex.test(mobile);
      const isValidEmail = emailRegex.test(email);

      const sweetAlert = (thing) => {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text:` Please enter a valid ${thing} (letters and spaces only!`,
        });
      };

      // Display validation messages if any field is invalid
      if (!isValidName || !name) {
        sweetAlert("name");
        return false;
      }
      if (!isValidAddress) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Please enter a valid address!",
        });
        return false;
      }
      if (!isValidCity) {
        sweetAlert("city");
        return false;
      }
      if (!isValidPincode) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Please enter a valid mobile number (exactly SIX digits)!",
        });
        return false;
      }
      if (!isValidMobile) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Please enter a valid mobile number (exactly TEN digits)!",
        });
        return false;
      }
      if (!isValidEmail) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Please enter a valid email!",
        });
        return false;
      }

      // All fields are valid
      return true;
    };


 function submitForm(){
    const form = document.getElementById('checkout-form')
    let check = validateForm()
    // const grandTotal = document.getElementById('grandTotal');
    const grandTotal = parseFloat(document.getElementById('grandTotal').textContent);

    if(check){
      if (grandTotal <= 1000) {
        Swal.fire("Checkout Successfully!!!");
        setTimeout(() => {
            form.submit();
        }, 2000);
    } else {
        Swal.fire("The total amount exceeds the maximum limit of 1000 for Cash on Delivery. Please select another payment method.");
    }

 }
 }