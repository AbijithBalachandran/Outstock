

document.getElementById('couponForm').addEventListener('submit', async function(event) {
  event.preventDefault();
  let form = event.target;

  // Regular expressions for validation
  const nameRegex = /^[a-zA-Z0-9\s]{3,50}$/;
  const typeRegex = /^(Product Base|Category Base)$/; // Correct regex for exact matches
  const discountRegex = /^([1-9][0-9]?|100)$/;

  let isValid = true;

  // Validate offerName
  if (!nameRegex.test(form.offerName.value)) {
      form.offerName.classList.add('is-invalid');
      isValid = false;
  } else {
      form.offerName.classList.remove('is-invalid');
  }

  // Validate offerType
  console.log('Offer Type Value:', form.offerType.value); // Debug statement
  if (!typeRegex.test(form.offerType.value)) {
      form.offerType.classList.add('is-invalid');
      isValid = false;
  } else {
      form.offerType.classList.remove('is-invalid');
  }

  // Validate offerDiscount
  if (!discountRegex.test(form.offerDiscount.value)) {
      form.offerDiscount.classList.add('is-invalid');
      isValid = false;
  } else {
      form.offerDiscount.classList.remove('is-invalid');
  }

  // Check other fields for HTML5 validation
  if (!form.checkValidity() || !isValid) {
      form.classList.add('was-validated');
      return;
  }

  // Extract values from form fields
  const offerName = form.offerName.value;
  const offerType = form.offerType.value;
  const discount = parseFloat(form.offerDiscount.value);
  const expiryDate = form.expiryDate.value;
  const selectedItems = getSelectedItems();




  
 
});
