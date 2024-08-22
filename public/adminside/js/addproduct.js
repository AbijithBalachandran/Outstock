
document.addEventListener('DOMContentLoaded', (event) => {
    const form = document.getElementById('productForm');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        const files = formData.getAll('images');
        const maxSize = 5 * 1024 * 1024; // 5MB

        for (const file of files) {
            if (file.size > maxSize) {
                Swal.fire({
                    icon: 'error',
                    title: 'Image Size Error',
                    text: 'Each image must be less than 5MB.',
                });
                return;
            }
        }

        const validationErrors = validateForm(formData);

        if (validationErrors.length > 0) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: validationErrors.map(error => error.message).join(', '),
            });
            return;
        }

        try {
            const response = await fetch('/admin/addProducts', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.json();
                Swal.fire({
                    icon: 'error',
                    title: 'Submission Error',
                    text: errorText.message || 'An error occurred while submitting the form.',
                });
            } else {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Product added successfully!',
                }).then(() => {
                    window.location.href = '/admin/productManagement';
                });
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Submission Error',
                text: 'An error occurred while submitting the form.',
            });
        }
    });


    function validateForm(formData) {
        const errors = [];
        
        const namePattern = /^[a-zA-Z0-9\s-]+$/;
        // const namePattern = /^(?!.*([a-zA-Z0-9\s-])\1)[a-zA-Z0-9\s-]+$/;
        const categoryPattern = /^[a-zA-Z\s]+$/;
        const pricePattern = /^\d+(\.\d{1,2})?$/;
        const quantityPattern = /^\d+$/;
        // const discountPattern = /^(100|[1-9]?[0-9])$/;

        if (!formData.get('name').trim() || !namePattern.test(formData.get('name').trim())) {
            errors.push({ field: 'name', message: 'Product Name is required and can only contain letters, numbers, spaces, and hyphens.' });
        }
        if (!formData.get('category').trim() || !categoryPattern.test(formData.get('category').trim())) {
            errors.push({ field: 'category', message: 'Category is required and can only contain letters and spaces.' });
        }
        if (!formData.get('action') || formData.get('action') === 'Choose....') {
            errors.push({ field: 'action', message: 'Action must be selected.' });
        }
        if (!formData.get('quantity').trim() || !quantityPattern.test(formData.get('quantity').trim()) || parseInt(formData.get('quantity').trim()) <= 0) {
            errors.push({ field: 'quantity', message: 'Quantity is required and must be a positive integer.' });
        }
        if (!formData.get('price').trim() || !pricePattern.test(formData.get('price').trim()) || parseFloat(formData.get('price').trim()) <= 0) {
            errors.push({ field: 'price', message: 'Original Price is required and must be a positive number.' });
        }
        
        if (!formData.get('type').trim() || !categoryPattern.test(formData.get('type').trim())) {
            errors.push({ field: 'type', message: 'Type is required and can only contain letters and spaces.' });
        }
        if (!formData.get('description').trim()) {
            errors.push({ field: 'description', message: 'Description is required.' });
        }
        if (formData.getAll('images').length !== 3) {
            errors.push({ field: 'images', message: 'You must upload exactly 3 images.' });
        }

        return errors;
    }

    function displayErrors(errors) {
        const errorFields = ['errorName', 'errorCategory', 'errorAction', 'errorQuantity', 'errorPrice', 'errorType', 'errorDescription', 'errorImages'];
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



