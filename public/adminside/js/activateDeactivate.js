
function activateDeactivate(offerId, status) {
      Swal.fire({
       title: "Are you sure?",
       text: "You won't be able to revert this!",
       icon: "warning",
       showCancelButton: true,
       confirmButtonText: status ? "Yes, Deactivate!" : "Yes, Activate!",
       cancelButtonText: "No, cancel!",
       reverseButtons: true
   }).then((result) => {
       if (result.isConfirmed) {
           fetch(`/admin/updateofferActivateAndDeActivate?offerId=${offerId}`, {
               method: 'PUT'
           })
               .then(response => {
                   if (response.ok) {
                       Swal.fire({
                           title: status ?  "Deactivated!":" Activated!" ,
                           text: status ? "The user has been Deactivated ." : "The user has been Activated.",
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
 