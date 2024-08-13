
// Image validation


document.addEventListener('DOMContentLoaded', (event) => {
    const form = document.getElementById('productForm');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        const validationErrors = validateForm(formData);

        if (validationErrors.length > 0) {
            displayErrors(validationErrors);
            return;
        }

        try {
            const response = await fetch('/admin/addProducts', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.json();
                displayErrors([{ field: 'form', message: errorText }]);
            } else {
                window.location.href = '/admin/productManagement';
            }
        } catch (error) {
            displayErrors([{ field: 'form', message: 'An error occurred while submitting the form.' }]);
        }
    });

    function validateForm(formData) {
        const errors = [];
        
        const namePattern = /^[a-zA-Z0-9\s-]+$/;
        // const namePattern = /^(?!.*([a-zA-Z0-9\s-])\1)[a-zA-Z0-9\s-]+$/;
        const categoryPattern = /^[a-zA-Z\s]+$/;
        const pricePattern = /^\d+(\.\d{1,2})?$/;
        const quantityPattern = /^\d+$/;
        const discountPattern = /^(100|[1-9]?[0-9])$/;

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
        if (!formData.get('discount').trim() || !discountPattern.test(formData.get('discount').trim())) {
            errors.push({ field: 'discount', message: 'Discount is required and must be a number between 0 and 100.' });
        }
        if (!formData.get('disPrice') || !pricePattern.test(formData.get('disPrice')) || parseFloat(formData.get('disPrice')) <= 0) {
            errors.push({ field: 'disPrice', message: 'Discount Price is required and must be a positive number.' });
        }
        if (parseFloat(formData.get('disPrice')) >= parseFloat(formData.get('price'))) {
            errors.push({ field: 'disPrice', message: 'Discount Price must be less than the Original Price.' });
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
        const errorFields = ['errorName', 'errorCategory', 'errorAction', 'errorQuantity', 'errorPrice', 'errorDiscount', 'errorDisPrice', 'errorType', 'errorDescription', 'errorImages'];
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

//discount price calculation

function calculateDiscountPrice() {
    var originalPriceInput = document.getElementById('originalPrice').value; 
    var discountPriceInput = document.getElementById('discountPrice'); 
    var discountInput = document.getElementById('discount').value;

    var originalPrice = parseFloat(originalPriceInput); 
    var discount = parseFloat(discountInput);

    if (!isNaN(originalPrice) && !isNaN(discount)) {
        const discountAmount = (originalPrice * discount) / 100;
        const discountedPrice = originalPrice - discountAmount;
        discountPriceInput.value = discountedPrice.toFixed(2);
    }
}

