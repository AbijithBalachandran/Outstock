
function removeProductWishlist(event, id, userId) {
      event.preventDefault();
      Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, remove!"
      }).then((result) => {
        if (result.isConfirmed) {
          fetch(`/remove-productWishlist?id=${id}`, {
            method: 'delete',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ productId: id, userId: userId })
          })
          .then(response => {
            if (response.ok) {
              Swal.fire({
                  title: "Removed!",
                  text: "Product has been removed.",
                  icon: "success"
                }).then(() => {
                  location.reload()
                })
            } else if (response.status === 401) {
              return response.json().then(data => {
                if (data.redirectUrl) {
                  console.log('redirect');
                  window.location.href = data.redirectUrl;
                  return;
                }
                console.log('thow error');
                throw new Error('Unauthorized, no redirect URL provided.');
              });
            } else {
              throw new Error(`Network response was not ok. Status: ${response.status}`);
            }
          })
          .then(data => {
            console.log('success');
            if (data) {
              console.log('data');
              if (data.success) {
                console.log('success-Swal.fire');
                Swal.fire({
                  title: "Removed!",
                  text: "Product has been removed.",
                  icon: "success"
                });
                console.log('document');
                document.querySelector(`button[data-product-id='${id}']`).closest('tr').remove();
                updateCartTotal(data.total);
              } else {
                Swal.fire({
                  title: "Error!",
                  text:"Failed to remove product.",
                  icon: "error"
                });
              }
            }
          })
          .catch((error) => {
            console.error('Error:', error);
            Swal.fire({
              title: "Error!",
              text: "Something went wrong.",
              icon: "error"
            });
          });
        }
      });
    }
