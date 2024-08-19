
async function changeQuantity(productId, mrp) {
  setTimeout(async () => {
      const value = document.getElementById(`quantity${productId}`);
      const increaseButton = document.getElementById(`increase${productId}`);
      const currentQuantity = parseInt(value.value);

      if (currentQuantity < 1 || currentQuantity > 5) {
          value.value = 5;
          Swal.fire({
              position: "center",
              icon: "warning",
              title: "The limit exceeds",
              showConfirmButton: false,
              timer: 1500
          });
          return;
      } else {
          const price = document.getElementById(`price${productId}`);
          price.textContent = mrp * currentQuantity;

          try {
              const response = await fetch(`/update-quantity?id=${productId}`, {
                  method: 'PUT',
                  headers: {
                      'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ productId, quantity: currentQuantity })
              });

              if (!response.ok) {
                  const errorData = await response.json();
                  if (response.status === 400 && errorData.message) {
                      Swal.fire({
                          position: "center",
                          icon: "warning",
                          title: errorData.message,
                          showConfirmButton: false,
                          timer: 1500
                      });

                      // Disable only the increase button for the specific product
                      if (increaseButton) {
                          increaseButton.disabled = true;
                      }

                      value.value = errorData.quantity;  // Reset to original quantity
                  } else {
                      throw new Error('Network response was not ok');
                  }
              } else {
                  const data = await response.json();
                  if (data.total) {
                      document.getElementById('total').textContent = data.total;
                  }
              }
          } catch (error) {
              console.error('There was a problem with the fetch operation:', error);
          }
      }
  }, 100);
}
