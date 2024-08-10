// function updateOrderStatus(orderId, newStatus) {
//       fetch('/update-status', {
//           method: 'POST',
//           headers: {
//               'Content-Type': 'application/json'
//           },
//           body: JSON.stringify({ orderId, newStatus })
//       })
//       .then(response => response.json())
//       .then(data => {
//           if (data.message) {
//               Swal.fire('Success', data.message, 'success').then(() => {
//                   location.reload();
//               });
//           }
//       })
//       .catch(error => {
//           console.error('Error:', error);
//       });
//   }

//   function confirmCancelOrder(orderId,newStatus) {
//       Swal.fire({
//           title: 'Are you sure?',
//           text: "Do you really want to cancel this order?",
//           icon: 'warning',
//           showCancelButton: true,
//           confirmButtonText: 'Yes, cancel it!',
//           cancelButtonText: 'No, keep it'
//       }).then((result) => {
//           if (result.isConfirmed) {
//               cancelOrder(orderId,newStatus);
//           }
//       });
//   }

//   function cancelOrder(orderId,newStatus) {
//       fetch('/cancelOrder', {
//           method: 'POST',
//           headers: {
//               'Content-Type': 'application/json'
//           },
//           body: JSON.stringify({ orderId,newStatus })
//       })
//       .then(response => response.json())
//       .then(data => {
//           if (data.message) {
//               Swal.fire('Cancelled', data.message, 'success').then(() => {
//                   location.reload();
//               });
//           }
//       })
//       .catch(error => {
//           console.error('Error:', error);
//       });
//   }
function submitReturnRequest(orderId) {
    const returnReason = document.getElementById('returnReason').value;
    if (!returnReason) {
        Swal.fire('Error', 'Please select a reason for return.', 'error');
        return;
    }

    updateOrderStatus(orderId, 'Return requested', returnReason);
}

function updateOrderStatus(orderId, newStatus, returnReason) {
    fetch('/update-status', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ orderId, newStatus, returnReason })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            Swal.fire('Success', data.message, 'success').then(() => {
                location.reload();
            });
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}


  function confirmCancelOrder(orderId,newStatus) {
      Swal.fire({
          title: 'Are you sure?',
          text: "Do you really want to cancel this order?",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, cancel it!',
          cancelButtonText: 'No, keep it'
      }).then((result) => {
          if (result.isConfirmed) {
              cancelOrder(orderId,newStatus);
          }
      });
  }

  function cancelOrder(orderId,newStatus) {
      fetch('/cancelOrder', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ orderId,newStatus })
      })
      .then(response => response.json())
      .then(data => {
          if (data.message) {
              Swal.fire('Cancelled', data.message, 'success').then(() => {
                  location.reload();
              });
          }
      })
      .catch(error => {
          console.error('Error:', error);
      });
  }