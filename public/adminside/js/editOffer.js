
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

document.getElementById('offerType').addEventListener('change', function () {
      const selectedValue = this.value;
      if (selectedValue === 'Category Base') {
          $('#categoryModal').modal('show');
      } else if (selectedValue === 'Product Base') {
          $('#productModal').modal('show');
      }
  });
  
  function saveSelections(formId) {
      const form = document.getElementById(formId);
      const selectedItems = Array.from(form.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
      $('#' + formId.replace('Form', 'Modal')).modal('hide');
      return selectedItems;
  }
  
  function closeModal(modalId) {
      $('#' + modalId).modal('hide');
  }
  


  function editOffer(event) {
  event.preventDefault();
  const id = document.getElementById('id').value;
  const offerName = document.getElementById('offerName').value;
  const offerType = document.getElementById('offerType').value;
  const discount = document.getElementById('offerDiscount').value;
  const expiryDate = document.getElementById('expiryDate').value;

  const selectedItems = getSelectedItems();

  const offerData = {
      id,
      offerName,
      offerType,
      discount,
      expiryDate,
      selectedItems
  };

  fetch('/admin/editOffer', {
      method: 'PUT',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(offerData)
  })
  .then(response => response.json())
  .then(data => {
      if (data.message === 'Offer applied successfully') {
        Swal.fire({
            title: "'OFFER EDIT SUCCESSFULY'!",
            text: "You clicked the button!",
            icon: "success"
          });
          window.location.href = "/admin/offerManagement";
      } else {
          Swal.fire(data.message);
      }
  })
  .catch(error => {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
  });
}

  
  function getSelectedItems() {
      const categoryItems = Array.from(document.querySelectorAll('#categoryModal input[type="checkbox"]:checked')).map(cb => cb.value);
      const productItems = Array.from(document.querySelectorAll('#productModal input[type="checkbox"]:checked')).map(cb => cb.value);
  
      return {
          categories: categoryItems,
          products: productItems
      };
  }
 
