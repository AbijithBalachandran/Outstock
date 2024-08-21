document.getElementById('offerForm').addEventListener('submit', async function(event) {
      event.preventDefault();
      let form = event.target;

      // Regular expressions for validation
      const nameRegex = /^[a-zA-Z0-9\s]{3,50}$/;
      const typeRegex = /^[a-zA-Z\s]{3,20}$/;
      const discountRegex = /^(100|[1-9]?[0-9])$/;

      let isValid = true;

      // Validate offerName
      if (!nameRegex.test(form.offerName.value)) {
        form.offerName.classList.add('is-invalid');
        isValid = false;
      } else {
        form.offerName.classList.remove('is-invalid');
      }

      // Validate offerType
      if (!typeRegex.test(form.offerType.value)) {
        form.offerType.classList.add('is-invalid');
        isValid = false;
      } else {
        form.offerType.classList.remove('is-invalid');
      }

      // Validate couponDiscount
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

      let data = {
        offerName: form.offerName.value,
        offerType: form.offerType.value,
        offerDiscount: form.offerDiscount.value,
        expiryDate: form.expiryDate.value
      };

     
    });