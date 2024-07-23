function updateUserStatus(userId, status) {
      Swal.fire({
          title: "Are you sure?",
          text: "You won't be able to revert this!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: status ? "Yes, unblock user!" : "Yes, block user!",
          cancelButtonText: "No, cancel!",
          reverseButtons: true
      }).then((result) => {
          if (result.isConfirmed) {
              fetch(`/admin/blockAndUnblockUser?userId=${userId}`, {
                  method: 'PUT'
              })
                  .then(response => {
                      if (response.ok) {
                          Swal.fire({
                              title: status ? "User Unblocked!" : "User Blocked!",
                              text: status ? "The user has been unblocked." : "The user has been blocked.",
                              icon: "success"
                          }).then(() => {
                              window.location.reload();
                          });
                      } else {
                          Swal.fire({
                              title: "Error",
                              text: "An error occurred while blocking the user.",
                              icon: "error"
                          });
                      }
                  })
                  .catch(error => {

                      console.error("Error:", error);
                      Swal.fire({
                          title: "Error",
                          text: "An error occurred while blocking the user.",
                          icon: "error"
                      });
                  });
          }
      });
  }
