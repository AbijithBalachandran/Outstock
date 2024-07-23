async function changeStatus(orderId) {
      const selectElement = document.getElementById('orderStatusSelect');
      const newStatus = selectElement.value;

      try {
          const response = await fetch(`/admin/update-status/${orderId}/${newStatus}`, {
              method: 'PUT',
              headers: {
                  'Content-Type': 'application/json'
              }
          });

          const result = await response.json();
          if (result.success) {
              Swal.fire({
                  position: "center",
                  icon: "success",
                  title: "Your work has been saved",
                  showConfirmButton: false,
                  timer: 1500
              });
          } else {
              alert(`Error: ${result.message}`);
          }
      } catch (error) {
          console.error('Error updating order status:', error);
          alert('An error occurred while updating the order status.' + error);
      }
  }