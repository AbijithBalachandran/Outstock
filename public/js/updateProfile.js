 
  document.addEventListener('DOMContentLoaded', (event) => {
      const form = document.getElementById('profile-form');
      
      form.addEventListener('submit',async(event)=>{
        event.preventDefault();
        
        const formData = new FormData(form);
        const data = {
          email : formData.get('email'),
          Fname: formData.get('Fname'),
          Lname: formData.get('Lname'),
          password: formData.get('password')
        };
    
        const submitBtn = document.getElementById("submit-btn");
        if (!submitBtn) {
          console.error('Submit button not found');
          return;
        }
    
        const userId = submitBtn.getAttribute("data-user-id");
        if (!userId) {
          console.error('User ID not found');
          return;
        }
    
        const statusMessage = document.getElementById('status-message');
        if (!statusMessage) {
          console.error('Status message element not found');
          return;
        }
    
        console.log('Sending update request with data:', data);
    
        try {
          console.log('responce');
          const response = await fetch(`/update-profile?id=${userId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
          });
    
          console.log('Response received:', response);
    
          if (response.ok) {
            statusMessage.textContent = 'Profile updated successfully';
            statusMessage.classList.remove('alert-danger');
            statusMessage.classList.add('alert', 'alert-success');
            window.location.href = `/update-profile?id=${userId}`;
          } else {
            let errorData;
            try {
              errorData = await response.json();
            } catch (jsonError) {
              console.error('Error parsing JSON:', jsonError);
            }
            // console.error('Server Error:', errorData || response.statusText);
            statusMessage.textContent = `Error: ${errorData?.error || response.statusText}`;
            statusMessage.classList.remove('alert-success');
            statusMessage.classList.add('alert', 'alert-danger');
          }
        } catch (error) {
          statusMessage.textContent = 'An unexpected error occurred. Please try again.';
          statusMessage.classList.remove('alert-success');
          statusMessage.classList.add('alert', 'alert-danger');
        }
      });
    
      });
    