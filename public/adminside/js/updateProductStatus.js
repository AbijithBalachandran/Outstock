function updateProductStatus(productId, status) {
      Swal.fire({
          title: "Are you sure?",
          text: "You won't be able to revert this!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: status ? "Yes, list!" : "Yes, Unlist!",
          cancelButtonText: "No, cancel!",
          reverseButtons: true
      }).then((result) => {
          if (result.isConfirmed) {
              fetch(`/admin/updateProductListAndUnlist?productId=${productId}`, {
                  method: 'PUT'
              })
                  .then(response => {
                      if (response.ok) {
                          Swal.fire({
                              title: status ? "  list!" : "Unlist!",
                              text: status ? "The user has been unlist." : "The user has been listed.",
                              icon: "success"
                          }).then(() => {
                              window.location.reload();
                          });
                      } else {
                          Swal.fire({
                              title: "Error",
                              text: "An error occurred while listing the Product.",
                              icon: "error"
                          });
                      }
                  })
                  .catch(error => {

                      console.error("Error:", error);
                      Swal.fire({
                          title: "Error",
                          text: "An error occurred while listing the Product.",
                          icon: "error"
                      });
                  });
          }
      });
  }
