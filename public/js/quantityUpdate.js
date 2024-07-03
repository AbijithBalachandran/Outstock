async function changeQuantity(productId, mrp) {
      setTimeout(() => {
        const value = document.getElementById(`quantity${productId}`)

        const currentQuantity = parseInt(value.value)
        if (currentQuantity < 1 || currentQuantity > 5) {
          const button = document.querySelectorAll('js-qty-adjust')
          value.value = 5;
          button.disaple = true;
          Swal.fire({
            position: "center",
            icon: "warning",
            title: "The limit exceeds",
            showConfirmButton: false,
            timer: 1500
          });
          return;
        } else {
          const price = document.getElementById(`price${productId}`)
          console.log(mrp, currentQuantity);
          price.textContent = mrp * currentQuantity;
          const response = fetch(`/update-quantity?id=${productId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ productId, quantity: currentQuantity })
          }).then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.json(); // or response.text(), response.blob(), etc.
          })
            .then(data => {
              if(data.total){
                document.getElementById('total').textContent=data.total;
              }
              if (data.message) {
                Swal.fire({
                  position: "center",
                  icon: "warning",
                  title: data.message,
                  showConfirmButton: false,
                  timer: 1500
                });
                value.value = data.quantity
              }
            })
            .catch(error => {
              console.error('There was a problem with the fetch operation:', error);
            })
        }

      }, 100)
    }