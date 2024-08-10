
    async function sortByPredefinedRange() {
        const sortValue = document.getElementById('sortOrders').value;
        console.log(`Sort by: ${sortValue}`);
    
        const filterParams = {
            sortValue
        };
    
        try {
            const response = await fetch('/admin/filterSalesReport', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(filterParams)
            });
    
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
            const data = await response.json();
            console.log(data);
            updateTable(data.orders);
        } catch (error) {
            console.error('Error fetching the sales report:', error);
        }
    }
    
    async function filterByCustomDateRange() {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        console.log(`Custom filter from: ${startDate} to: ${endDate}`);
    
        if (!startDate || !endDate) {
            alert('Please select both start and end dates.');
            return;
        }
    
        const filterParams = {
            startDate,
            endDate
        };
    
        try {
            const response = await fetch('/admin/customSalesReport', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(filterParams)
            });
    
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
            const data = await response.json();
            console.log(data);
            updateTable(data.orders);
        } catch (error) {
            console.error('Error fetching the sales report:', error);
        }
    }
    
    function updateTable(orders) {
        const tableBody = document.getElementById('orders-products-table');
        tableBody.innerHTML = '';
    
        if (orders.length > 0) {
            orders.forEach(order => {
                order.orderItem.forEach(orderItem => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${order._id}</td>
                        <td>${orderItem.productName}</td>
                        <td>${orderItem.quantity}</td>
                        <td>${orderItem.price}</td>
                        <td>${order.couponDetails.discount || order.offerDetails.discount || 'N/A'}</td>
                        <td>${order.totalPrice}</td>
                        <td>${order.paymentMethod}</td>
                    `;
                    tableBody.appendChild(row);
                });
            });
        } else {
            const noDataRow = document.createElement('tr');
            noDataRow.innerHTML = '<td colspan="7" class="text-center">Order Not Found</td>';
            tableBody.appendChild(noDataRow);
        }
    }
    