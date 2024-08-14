
//-------------- Croper Script -----------------------------------------//
// image script-------------------------------


          function previewImage(event, previewId) {
           const reader = new FileReader();
             reader.onload = function () {
        const output = document.getElementById(previewId);
        output.src = reader.result;
             }
         reader.readAsDataURL(event.target.files[0]);
        }
                    



        let cropper;
        let currentImagePreviewId;
    
        function handleImageUpload(event, imagePreviewId) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    currentImagePreviewId = imagePreviewId;
                    const imageToCrop = document.getElementById('imageToCrop');
                    imageToCrop.src = e.target.result;
                    showModal();
                    initializeCropper();
                };
                reader.readAsDataURL(file);
            }
        }
    
        function showModal() {
            const modal = document.getElementById('cropModal');
            modal.style.display = "block";
        }
    
        function initializeCropper() {
            const imageToCrop = document.getElementById('imageToCrop');
            cropper = new Cropper(imageToCrop, {
                aspectRatio: 1,
                viewMode: 1
            });
        }
    
        function cropImage() {
            const canvas = cropper.getCroppedCanvas();
            const croppedImageURL = canvas.toDataURL('image/png');
    
            // Set the cropped image to the image preview
            const imagePreview = document.getElementById(currentImagePreviewId);
            imagePreview.src = croppedImageURL;
    
            closeModal();
        }
    
        function closeModal() {
            const modal = document.getElementById('cropModal');
            modal.style.display = "none";
            cropper.destroy();
        }
    
        // Close the modal when the user clicks on <span> (x)
        document.querySelector('.close').onclick = function() {
            closeModal();
        };
    
        // Close the modal when the user clicks anywhere outside of the modal
        window.onclick = function(event) {
            const modal = document.getElementById('cropModal');
            if (event.target === modal) {
                closeModal();
            }
        };