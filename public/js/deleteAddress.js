document.addEventListener('DOMContentLoaded',(event)=>{
      const deleteButton = document.querySelectorAll('.delete-button')
     deleteButton.forEach(button=>{
      button.addEventListener('click',async(event)=>{
           event.preventDefault();

           const addressId = button.getAttribute('data-id');
    
      try {
        const response = await fetch(`/manage-address?id=${addressId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          window.location.reload();
        } else {
          const errorText = await response.json();
          alert(`Error: ${errorText.message}`);
        }
      } catch (error) {
        alert('An error occurred while deleting the address.');
      }
    }
      )
     });
    });