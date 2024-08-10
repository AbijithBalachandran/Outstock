
function addProductCart(event, id) {
      event.preventDefault();
      Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, Add!"
      }).then((result) => {       
            if (result.isConfirmed) {
                  Swal.fire({
                        title: "Add!",
                        text: "You add the product to cart.",
                        icon: "success"
                      });
                      
                  fetch(`/cart-add?id=${id}`) 
                        .then(async response => {
                              if (response.ok) {
                                    return response.json();
                              } else if (response.status === 401) {
                                    const data = await response.json();
                                    if (data.redirectUrl) {
                                          window.location.href = data.redirectUrl;
                                          return;
                                    }
                                    throw new Error('Unauthorized, no redirect URL provided.');
                              } else if(response.status === 400) {
                                    Swal.fire({
                                          title: "Zero Quantity",
                                          text: "Product out of stock.",
                                          icon: "fail"
                                    });
                              }else{
                                    throw new Error('Network response was not ok.');
                              }
                        })
                        .then(data => {
                              if (data) {
                                    if (data.success) {
                                          Swal.fire({
                                          title: "Added!",
                                          text: "Product has been Added.",
                                          icon: "success"
                                    }); 
                                    }
                                    if (data.exist) {
                                          Swal.fire({
                                          title: "exist",
                                          text: "Product Already exist in the cart.",
                                          icon: "fail"
                                    });
                                    }
                                    console.log('Success:', data);
                              }
                        })
                        .catch((error) => {
                              console.error('Error:', error);
                              console.log("Something went wrong");
                        });

            }
      });

}