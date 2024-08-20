
    async function sortByPredefinedRange() {
        const sortValue = document.getElementById('sortOrders').value;
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const currentPage = 1; // Reset to first page on sort
    
        let url = `/admin/salesReport?page=${currentPage}&sortValue=${sortValue}`;
        if (startDate && endDate) {
            url += `&startDate=${startDate}&endDate=${endDate}`;
        }
    
        window.location.href = url;
    }
    
    async function filterByCustomDateRange() {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const sortValue = document.getElementById('sortOrders').value;
        const currentPage = 1; // Reset to first page on filter
    
        if (!startDate || !endDate) {
            Swal.fire({
                icon: "error",
                title: "Select Dates",
                text: "Please select both start and end dates.",
            })
            return;
        }
    
        let url = `/admin/salesReport?page=${currentPage}&startDate=${startDate}&endDate=${endDate}`;
        if (sortValue) {
            url += `&sortValue=${sortValue}`;
        }
    
        window.location.href = url;
    }
    
    document.addEventListener('DOMContentLoaded', function () {
        const urlParams = new URLSearchParams(window.location.search);
        const sortValue = urlParams.get('sortValue');
        const startDate = urlParams.get('startDate');
        const endDate = urlParams.get('endDate');
    
        if (sortValue) {
            document.getElementById('sortOrders').value = sortValue;
        }
        if (startDate) {
            document.getElementById('startDate').value = startDate;
        }
        if (endDate) {
            document.getElementById('endDate').value = endDate;
        }
    });
    
    

    