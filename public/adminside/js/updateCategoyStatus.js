function updateCategoyStatus(categoryId, status) {
      Swal.fire({
          title: "Are you sure?",
          text: "You won't be able to revert this!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: status ? "Yes, unlist!" : "Yes, list!",
          cancelButtonText: "No, cancel!",
          reverseButtons: true
      }).then((result) => {
          if (result.isConfirmed) {
              fetch(`/admin/updateCategoyListAndUnlist?categoryId=${categoryId}`, {
                  method: 'PUT'
              })
                  .then(response => {
                      if (response.ok) {
                          Swal.fire({
                              title: status ?  " listed!":"Unlist!" ,
                              text: status ? "The user has been unlist." : "The user has been listed.",
                              icon: "success"
                          }).then(() => {
                              window.location.reload();
                          });
                      } else {
                          Swal.fire({
                              title: "Error",
                              text: "An error occurred while listing the user.",
                              icon: "error"
                          });
                      }
                  })
                  .catch(error => {

                      console.error("Error:", error);
                      Swal.fire({
                          title: "Error",
                          text: "An error occurred while listing the user.",
                          icon: "error"
                      });
                  });
          }
      });
  }