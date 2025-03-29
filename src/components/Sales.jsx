import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import "jspdf-autotable";

export default function SalesTable() {
  const [sales, setSales] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [filteredSales, setFilteredSales] = useState([]);
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    fetch("http://localhost:8080/api/sales")
      .then((response) => response.json())
      .then((data) => {
        setSales(data);
        setFilteredSales(data);
      })
      .catch((error) => console.error("Error fetching sales:", error));
  }, []);

  // Sorting function
  const sortedSales = [...filteredSales].sort((a, b) => {
    if (!sortConfig.key) return 0;

    let valueA = a[sortConfig.key];
    let valueB = b[sortConfig.key];

    if (sortConfig.key === "createdAt") {
      valueA = new Date(valueA);
      valueB = new Date(valueB);
    } else if (sortConfig.key === "totalAmount") {
      valueA = parseFloat(valueA);
      valueB = parseFloat(valueB);
    } else if (sortConfig.key === "seller") {
      valueA = a.seller?.name || "";
      valueB = b.seller?.name || "";
    } else if (sortConfig.key === "customer") {
      valueA = a.customer?.name || "";
      valueB = b.customer?.name || "";
    }

    if (valueA < valueB) return sortConfig.direction === "asc" ? -1 : 1;
    if (valueA > valueB) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  // Handle sorting
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Filter by date
  const handleDateFilter = (event) => {
    const selectedDate = event.target.value;
    setDateFilter(selectedDate);

    if (selectedDate) {
      setFilteredSales(sales.filter((sale) => sale.createdAt.startsWith(selectedDate)));
    } else {
      setFilteredSales(sales);
    }
  };

  // Export to CSV
  const downloadCSV = () => {
    const ws = XLSX.utils.json_to_sheet(
      sortedSales.map((sale) => ({
        Seller: sale.seller?.name,
        Customer: sale.customer?.name,
        Products: sale.cart.map((item) => item.name).join(", "),
        Quantity: sale.cart.map((item) => item.quantity).join(", "),
        Price: sale.cart.map((item) => item.price).join(", "),
        TotalAmount: sale.totalAmount,
        Date: new Date(sale.createdAt).toLocaleDateString(),
      }))
    );

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sales Report");
    XLSX.writeFile(wb, "sales_report.xlsx");
  };

//   const downloadPDF = () => {
//     const doc = new jsPDF();
//     doc.text("Sales Report", 20, 10);
  
//     const tableData = sortedSales.map((sale) => [
//       sale.seller?.name || "N/A",
//       sale.customer?.name || "N/A",
//       sale.cart.map((item) => item.name).join(", "),
//       sale.cart.map((item) => item.quantity).join(", "),
//       sale.cart.map((item) => item.price).join(", "),
//       `Rs. ${sale.totalAmount}`,
//       new Date(sale.createdAt).toLocaleDateString(),
//     ]);
  
//     doc.autoTable({
//       head: [["Seller", "Customer", "Products", "Quantity", "Price", "Total Amount", "Date"]],
//       body: tableData,
//       startY: 20, // Ensures the table starts below the title
//     });
  
//     doc.save("sales_report.pdf");
//   };

  return (
    <div className="flex flex-col h-screen ml-[210px] xl:ml-[328px] p-1 bg-gray-50">
      <h2 className="text-2xl font-bold text-center mt-4">Sales Data</h2>

      {/* Download Section */}
      <div className="flex justify-between items-center bg-gray-100 p-4 rounded-lg shadow-md mb-4">
        <h3 className="text-lg font-semibold">Sales Report</h3>
        <div>
          <button onClick={downloadCSV} className="bg-green-500 text-white px-3 py-1 rounded mr-2">
            Download Sales Report
          </button>
         
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-gray-100 p-4 rounded-lg shadow-md mb-4">
        <h3 className="text-lg font-semibold mb-2">Filters</h3>
        <div className="grid grid-cols-5 gap-4">
          <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={() => requestSort("seller")}>
            Sort by Seller
          </button>
          <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={() => requestSort("customer")}>
            Sort by Customer
          </button>
          <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={() => requestSort("totalAmount")}>
            Sort by Total Amount
          </button>
          <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={() => requestSort("createdAt")}>
            Sort by Date
          </button>
          <input
            type="date"
            value={dateFilter}
            onChange={handleDateFilter}
            className="border rounded px-3 py-1"
          />
        </div>
      </div>

      {/* Sales Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse shadow-md rounded-lg text-sm">
          <thead>
            <tr className="bg-gray-300 text-gray-700">
              <th className="p-2">Seller</th>
              <th className="p-2">Customer</th>
              <th className="p-2">Product Name</th>
              <th className="p-2">Quantity</th>
              <th className="p-2">Price</th>
              <th className="p-2">Total Amount</th>
              <th className="p-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {sortedSales.map((sale) =>
              sale.cart.map((item, index) => (
                <tr key={`${sale._id}-${index}`} className="text-center border-b hover:bg-gray-100">
                  <td className="p-2">{index === 0 ? sale.seller?.name || "N/A" : ""}</td>
                  <td className="p-2">{index === 0 ? sale.customer?.name || "N/A" : ""}</td>
                  <td className="p-2">{item.name}</td>
                  <td className="p-2">{item.quantity}</td>
                  <td className="p-2">Rs. {item.price}</td>
                  <td className="p-2 font-semibold">{index === 0 ? `Rs. ${sale.totalAmount}` : ""}</td>
                  <td className="p-2">{index === 0 ? new Date(sale.createdAt).toLocaleDateString() : ""}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
