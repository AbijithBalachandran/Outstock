
document.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOM fully loaded and parsed');

    const form = document.getElementById('categoryForm');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = {};
        new FormData(form).forEach((value, key) => formData[key] = value);

        const validationErrors = validateForm(formData);

        if (validationErrors.length > 0) {
            displayErrors(validationErrors);
            return;
        }

        try {
            const response = await fetch('/admin/addCategory', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData),
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
                    window.location.href = '/admin/categoryManagement';
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

    function displayErrors(errors) {
        if (errors.length > 0) {
            // Collect all error messages into a single string
            const errorMessages = errors.map(error => error.message).join('<br>');
    
            // Use SweetAlert to display the errors
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                html: errorMessages, // Display all error messages in the alert
            });
        }
    }
    
    function validateForm(formData) {
        const errors = [];
        const categoryPattern = /^[a-zA-Z]+(?:\s[a-zA-Z]+)*$/;
    
        if (!formData['name'] || !categoryPattern.test(formData['name'].trim())) {
            errors.push({ field: 'name', message: 'Category name is required and can only contain letters and spaces.' });
        }
    
        return errors;
    }
    
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    // Example usage when submitting a form
    document.getElementById('yourFormId').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the form from submitting if there are validation errors
        const formData = {
            name: document.getElementById('categoryName').value
        };
        const errors = validateForm(formData);
        displayErrors(errors);
    
        if (errors.length === 0) {
            // Proceed with form submission if there are no validation errors
            this.submit();
        }
    });
    
 });

