       
// document.addEventListener('DOMContentLoaded', (event) => {
//       const form = document.getElementById('categoryForm');
  
//       form.addEventListener('submit', async (event) => {
//           event.preventDefault();
  
//           const formData = new FormData(form);
//           const validationErrors = validateForm(formData);
  
//           if (validationErrors.length > 0) {
//               displayErrors(validationErrors);
//               return;
//           }
  
//           try {
//               const response = await fetch('/admin/addCategory', {
//                   method: 'POST',
//                   body: formData,
//               });
  
//               if (!response.ok) {
//                   const errorText = await response.json();
//                   displayErrors([{ field: 'form', message: errorText }]);
//               } else {
//                   window.location.href = '/admin/addCategory';
//               }
//           } catch (error) {
//               displayErrors([{ field: 'form', message: 'An error occurred while submitting the form.' }]);
//           }
//       });
  
//       function validateForm(formData) {
//           const errors = [];
  
//           const categoryPattern = /^[a-zA-Z\s]+$/;
  
//           if (!formData.get('name') || !categoryPattern.test(formData.get('name'))) {
//               errors.push({ field: 'name', message: 'Category is required and can only contain letters and spaces.' });
//           }
//           return errors;
//       }
  
//       function displayErrors(errors) {
//           const errorFields = ['errorCategory'];
//           errorFields.forEach(field => {
//               document.getElementById(field).innerHTML = '';
//           });
  
//           errors.forEach(error => {
//               const errorElement = document.getElementById(`error${capitalizeFirstLetter(error.field)}`);
//               if (errorElement) {
//                   errorElement.textContent = error.message;
//               }
//           });
//       }
  
//       function capitalizeFirstLetter(string) {
//           return string.charAt(0).toUpperCase() + string.slice(1);
//       }
//   });
  

document.addEventListener('DOMContentLoaded', (event) => {
    const form = document.getElementById('categoryForm');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        const validationErrors = validateForm(formData);

        if (validationErrors.length > 0) {
            displayErrors(validationErrors);
            return;
        }

        try {
            const response = await fetch('/admin/addCategory', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.json();
                displayErrors([{ field: 'form', message: errorText }]);
            } else {
                window.location.href = '/admin/addCategory';
            }
        } catch (error) {
            displayErrors([{ field: 'form', message: 'An error occurred while submitting the form.' }]);
        }
    });

    function validateForm(formData) {
        const errors = [];

        const categoryPattern = /^[a-zA-Z\s]+$/;

        if (!formData.get('name') || !categoryPattern.test(formData.get('name'))) {
            errors.push({ field: 'name', message: 'Category is required and can only contain letters and spaces.' });
        }
        return errors;
    }

    function displayErrors(errors) {
        const errorFields = ['errorCategory'];
        errorFields.forEach(field => {
            document.getElementById(field).innerHTML = '';
        });

        errors.forEach(error => {
            const errorElement = document.getElementById(`error${capitalizeFirstLetter(error.field)}`);
            if (errorElement) {
                errorElement.textContent = error.message;
            }
        });
    }

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
});
