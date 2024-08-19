       
// document.addEventListener('DOMContentLoaded', (event) => {
//     console.log('DOM fully loaded and parsed');

//     const form = document.getElementById('categoryForm');

//     form.addEventListener('submit', async (event) => {
//         event.preventDefault();

//         const formData = {};
//         new FormData(form).forEach((value, key) => formData[key] = value);

//         // Debugging: Log formData entries
//        console.log('FormData:', formData);

//         const validationErrors = validateForm(formData);

//         if (validationErrors.length > 0) {
//             displayErrors(validationErrors);
//             return;
//         }

//         try {
//             const response = await fetch('/admin/addCategory', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify(formData),
//             });

//             if (!response.ok) {
//                 const errorText = await response.json();
//                 displayErrors([{ field: 'form', message: errorText }]);
//             } else {
//                 window.location.href = '/admin/categoryManagement';
//             }
//         } catch (error) {
//             displayErrors([{ field: 'form', message: 'An error occurred while submitting the form.' }]);
//         }
//     });

//     function validateForm(formData) {
//         const errors = [];
//         const categoryPattern = /^[a-zA-Z]+(?:\s[a-zA-Z]+)*$/;

//         if (!formData['name'] || !categoryPattern.test(formData['name'].trim())) {
//             errors.push({ field: 'name', message: 'Category is required and can only contain letters and spaces.' });
//         }
//         return errors;
//     }

//     function displayErrors(errors) {
//         const errorFields = ['errorCategory'];
//         errorFields.forEach(field => {
//             document.getElementById(field).innerHTML = '';
//         });

//         errors.forEach(error => {
//             const errorElement = document.getElementById(`error${capitalizeFirstLetter(error.field)}`);
//             if (errorElement) {
//                 errorElement.textContent = error.message;
//             }
//         });
//     }

//     function capitalizeFirstLetter(string) {
//         return string.charAt(0).toUpperCase() + string.slice(1);
//     }
// });


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

    function validateForm(formData) {
        const errors = [];
        const categoryPattern = /^[a-zA-Z]+(?:\s[a-zA-Z]+)*$/;

        if (!formData['name'] || !categoryPattern.test(formData['name'].trim())) {
            errors.push({ field: 'name', message: 'Category name is required and can only contain letters and spaces.' });
        }
        return errors;
    }
});

