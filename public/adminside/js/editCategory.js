
// document.addEventListener('DOMContentLoaded', (event) => {
//       const form = document.getElementById('editcategoryForm');
    
//       form.addEventListener('submit', async (event) => {
//           event.preventDefault();
//           const categoryId = document.getElementById('save-btn').getAttribute('data-id');
//           const formData = new FormData(form);
//           formData.append('id', categoryId);
  
//           const validationErrors = validateForm(formData);
    
//           if (validationErrors.length > 0) {
//               displayErrors(validationErrors);
//               return;
//           }
    
//           try {
//               const response = await fetch(`/admin/editCategory`, {
//                   method: 'PUT',
//                   body: new URLSearchParams(formData), 
//                   headers: {
//                       'Content-Type': 'application/x-www-form-urlencoded',
//                   },
//               });
    
//               if (!response.ok) {
//                   const errorText = await response.text();
//                   displayErrors([{ field: 'form', message: errorText }]);
//               } else {
//                   window.location.href = `/admin/categoryManagement`;
//               }
//           } catch (error) {
//               displayErrors([{ field: 'form', message: 'An error occurred while submitting the form.' }]);
//           }
//       });
    
//       function validateForm(formData) {
//           const errors = [];
//           const categoryPattern = /^[a-zA-Z]+(?:\s[a-zA-Z]+)*$/;
    
//           if (!formData.get('name') || !categoryPattern.test(formData.get('name'))) {
//               errors.push({ field: 'name', message: 'Category is required and can only contain letters and single spaces between words. No leading or trailing spaces.' });
//           }
//           return errors;
//       }
    
//       function displayErrors(errors) {
//           // Clear existing errors
//           document.querySelectorAll('.text-danger').forEach(element => {
//               element.textContent = '';
//           });
    
//           errors.forEach(error => {
//               const errorElement = document.getElementById(`error${capitalizeFirstLetter(error.field)}`);
//               if (errorElement) {
//                   errorElement.textContent = error.message;
//               } else {
//                   console.error(`Error element for field ${error.field} not found.`);
//               }
//           });
//       }
    
//       function capitalizeFirstLetter(string) {
//           return string.charAt(0).toUpperCase() + string.slice(1);
//       }
//   });
  
document.addEventListener('DOMContentLoaded', (event) => {
    const form = document.getElementById('editcategoryForm');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const categoryId = document.getElementById('save-btn').getAttribute('data-id');
        const formData = new FormData(form);
        formData.append('id', categoryId);

        const validationErrors = validateForm(formData);

        if (validationErrors.length > 0) {
            displayErrors(validationErrors);
            return;
        }

        try {
            const response = await fetch(`/admin/editCategory`, {
                method: 'PUT',
                body: new URLSearchParams(formData),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            const data = await response.json();

            if (!data.success) {
                Swal.fire({
                    title: 'Error',
                    text: data.message,
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            } else {
                Swal.fire({
                    title: 'Success',
                    text: data.message,
                    icon: 'success',
                    confirmButtonText: 'OK'
                }).then(() => {
                    window.location.href = `/admin/categoryManagement`;
                });
            }
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'An error occurred while submitting the form.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    });

    function validateForm(formData) {
        const errors = [];
        const categoryPattern = /^[a-zA-Z]+(?:\s[a-zA-Z]+)*$/;

        if (!formData.get('name') || !categoryPattern.test(formData.get('name'))) {
            errors.push({ field: 'name', message: 'Category is required and can only contain letters and single spaces between words. No leading or trailing spaces.' });
        }
        return errors;
    }

    function displayErrors(errors) {
        // Clear existing errors
        document.querySelectorAll('.text-danger').forEach(element => {
            element.textContent = '';
        });

        errors.forEach(error => {
            const errorElement = document.getElementById(`error${capitalizeFirstLetter(error.field)}`);
            if (errorElement) {
                errorElement.textContent = error.message;
            } else {
                console.error(`Error element for field ${error.field} not found.`);
            }
        });
    }

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
});
