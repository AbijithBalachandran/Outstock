
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
 
