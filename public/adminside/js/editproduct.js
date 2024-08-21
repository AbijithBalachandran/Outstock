// Image validation

function previewImage(event, previewId) {
    const reader = new FileReader();
    reader.onload = function () {
        const output = document.getElementById(previewId);
        output.src = reader.result;
    }
    reader.readAsDataURL(event.target.files[0]);
}


document.addEventListener('DOMContentLoaded', (event) => {
    const form = document.getElementById('productForm');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        console.log("Form Data Entries:", Array.from(formData.entries())); // Log all form data

        const validationErrors = validateForm(formData);

        if (validationErrors.length > 0) {
            console.log("Validation errors found:", validationErrors);
            displayErrors(validationErrors);
            return;
        }

        try {
            const response = await fetch('/admin/editProduct', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: result.message || 'An error occurred while submitting the form.',
                });
            } else {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: result.message || 'Product updated successfully',
                }).then(() => {
                    window.location.href = '/admin/productManagement';
                });
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'An error occurred while submitting the form.',
            });
        }
    });

      function validateForm(formData) {
          const errors = [];
  
          const namePattern = /^[a-zA-Z0-9\s-]+$/;
          const categoryPattern = /^[a-zA-Z\s]+$/;
          const pricePattern = /^\d+(\.\d{1,2})?$/;
          const quantityPattern = /^\d+$/;
          const discountPattern = /^(100|[1-9]?[0-9])$/;
  
          // Product Name validation
          const name = formData.get('name').trim();
          if (!name || !namePattern.test(name)) {
            //   console.log("Name validation failed", name);
              errors.push({ field: 'name', message: 'Product Name is required and can only contain letters, numbers, spaces, and hyphens.' });
          }
  
          // Category validation
          const category = formData.get('category').trim();
          if (!category || !categoryPattern.test(category)) {
              console.log("Category validation failed", category);
              errors.push({ field: 'category', message: 'Category is required and can only contain letters and spaces.' });
          }
  
          // Action validation
          const action = formData.get('action');
          if (!action || action === 'Choose....') {
              console.log("Action validation failed", action);
              errors.push({ field: 'action', message: 'Action must be selected.' });
          }
  
          // Quantity validation
          const quantity = formData.get('quantity').trim();
          if (!(quantityPattern.test(quantity))) {
              console.log("Quantity validation failed", quantity);
              errors.push({ field: 'quantity', message: 'Quantity is required and can not be negative number.' });
          }
  
          // Original Price validation
          const price = formData.get('price').trim();
          if (!price || !pricePattern.test(price) || parseFloat(price) <= 0) {
              console.log("Price validation failed", price);
              errors.push({ field: 'price', message: 'Original Price is required and must be a positive number.' });
          }
  
          // Discount validation
          const discount = formData.get('discount').trim();
          if (!discount || !discountPattern.test(discount)) {
              console.log("Discount validation failed", discount);
              errors.push({ field: 'discount', message: 'Discount is required and must be a number between 0 and 100.' });
          }
  
          // Discount Price validation
          const disPrice = formData.get('disPrice');
          if (!disPrice || !pricePattern.test(disPrice) || parseFloat(disPrice) <= 0) {
              console.log("Discount Price validation failed", disPrice);
              errors.push({ field: 'disPrice', message: 'Discount Price is required and must be a positive number.' });
          }
          if (parseFloat(disPrice) >= parseFloat(price)) {
              console.log("Discount Price comparison failed", disPrice, price);
              errors.push({ field: 'disPrice', message: 'Discount Price must be less than the Original Price.' });
          }
  
          // Type validation
          const type = formData.get('type').trim();
          if (!type || !categoryPattern.test(type)) {
              console.log("Type validation failed", type);
              errors.push({ field: 'type', message: 'Type is required and can only contain letters and spaces.' });
          }
  
          // Description validation
          const description = formData.get('description').trim();
          if (!description) {
              console.log("Description validation failed", description);
              errors.push({ field: 'description', message: 'Description is required.' });
          }
  
          // Images validation
          const images = formData.getAll('images');
          if (images.length !== 3) {
              console.log("Images validation failed", images.length);
              errors.push({ field: 'images', message: 'You must upload exactly 3 images.' });
          }
  
          return errors;
      }
  
      function displayErrors(errors) {
          const errorFields = ['errorName', 'errorCategory', 'errorAction', 'errorQuantity', 'errorPrice', 'errorDiscount', 'errorDisPrice', 'errorType', 'errorDescription', 'errorImages'];
  
          errorFields.forEach(field => {
              const errorElement = document.getElementById(field);
              if (errorElement) {
                  errorElement.innerHTML = '';
              } else {
                  console.warn(`Error element with ID ${field} not found.`);
              }
          });
  
          errors.forEach(error => {
              const errorElement = document.getElementById(`error${capitalizeFirstLetter(error.field)}`);
              if (errorElement) {
                  errorElement.textContent = error.message;
              } else {
                  console.warn(`Error element for field ${error.field} not found.`);
              }
          });
      }
  
      function capitalizeFirstLetter(string) {
          return string.charAt(0).toUpperCase() + string.slice(1);
      }
  });
  
  function calculateDiscountPrice() {
      var originalPriceInput = document.getElementById('originalPrice').value;
      var discountPriceInput = document.getElementById('discountPrice');
      var discountInput = document.getElementById('discount').value;
  
      var originalPrice = parseFloat(originalPriceInput);
      var discount = parseFloat(discountInput);
  
      if (!isNaN(originalPrice) && !isNaN(discount)) {
          const discountAmount = (originalPrice * discount) / 100;
          const discountedPrice = originalPrice - discountAmount;
          discountPriceInput.value = Math.floor(discountedPrice).toFixed(2);
      }
  }
  
