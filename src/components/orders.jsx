import 'font-awesome/css/font-awesome.min.css';
import { useEffect, useState } from 'react';
import Popup from './Popup';
import SortPopup from './SortPopup';
const Orders = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(7);
    const [orders, setOrders] = useState([]);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isSortVisible, setIsSortVisible] = useState(false);
    const [sortOrder, setSortOrder] = useState('ascending'); // Default 
    const [newOrder, setNewOrder] = useState({
        productName: '',
        productId: '',
        category: '',
        orderValue: '',
        quantity: '',
        unit: '',
        buyingPrice: '',
        deliveryDate: '',
        notifyOnDelivery: false,
        status: 'Confirmed'
    });

    const [totalOrders, setTotalOrders] = useState(0);
    const [totalReceived, setTotalReceived] = useState(0);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [totalReturned, setTotalReturned] = useState(0);
    const [totalReturnCost, setTotalReturnCost] = useState(0);
    const [onTheWay, setOnTheWay] = useState(0);
    const [onTheWayCost, setOnTheWayCost] = useState(0);

    // Calculate statistics from orders
    useEffect(() => {
        const calculateStatistics = () => {
            let totalOrders = orders.length;
            let totalReceived = 0;
            let totalRevenue = 0;
            let totalReturned = 0;
            let totalReturnCost = 0;
            let onTheWay = 0;
            let onTheWayCost = 0;

            orders.forEach((order) => {
                if (order.status === 'Received') {
                    totalReceived += order.quantity;
                    totalRevenue += order.orderValue;
                } else if (order.status === 'Returned') {
                    totalReturned += order.quantity;
                    totalReturnCost += order.orderValue;
                } else if (order.status === 'On the way') {
                    onTheWay += order.quantity;
                    onTheWayCost += order.orderValue;
                }
            });

            setTotalOrders(totalOrders);
            setTotalReceived(totalReceived);
            setTotalRevenue(totalRevenue);
            setTotalReturned(totalReturned);
            setTotalReturnCost(totalReturnCost);
            setOnTheWay(onTheWay);
            setOnTheWayCost(onTheWayCost);
        };

        calculateStatistics();
    }, [orders]); // Recalculate whenever `orders` changes

    // Fetch orders
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/orders');
                const data = await response.json();
                setOrders(data);
            } catch (error) {
                console.error('Error fetching orders:', error);
            }
        };
        fetchOrders();
    }, []);
    // sorting based on price
    const handleSort = (order) => {
        setSortOrder(order);
        setIsSortVisible(false); // Close the sort 
    };

    // Sort products 
    const sortedOrders = [...orders].sort((a, b) => {
        if (sortOrder === 'ascending') {
            return a.orderValue - b.orderValue;
        } else {
            return b.orderValue - a.orderValue;
        }
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sortedOrders.slice(indexOfFirstItem, indexOfLastItem);

    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(orders.length / itemsPerPage); i++) {
        pageNumbers.push(i);
    }

    const handlePageChange = (pageNumber) => {
        if (pageNumber < 1 || pageNumber > pageNumbers.length) return; // Prevent out of bounds
        setCurrentPage(pageNumber);
    };

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/orders');
                const data = await response.json();
                setOrders(data);

                // Fetch order statistics
                const statsResponse = await fetch('http://localhost:8080/api/orders/stats');
                if (!statsResponse.ok) {
                    throw new Error('Failed to fetch order statistics');
                }
                const statsData = await statsResponse.json();
                setTotalOrders(statsData.totalOrders);
                setTotalReceived(statsData.totalReceived);
                setTotalRevenue(statsData.totalRevenue);
                setTotalReturned(statsData.totalReturned);
                setTotalReturnCost(statsData.totalReturnCost);
                setOnTheWay(statsData.onTheWay);
                setOnTheWayCost(statsData.onTheWayCost);
            } catch (error) {
                console.error('Error fetching orders:', error);
            }
        };
        fetchOrders();
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewOrder((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const orderToSubmit = {
            productName: newOrder.productName,
            productId: newOrder.productId,
            category: newOrder.category,
            orderValue: parseFloat(newOrder.orderValue),
            quantity: parseInt(newOrder.quantity),
            unit: parseInt(newOrder.unit),
            buyingPrice: parseFloat(newOrder.buyingPrice),
            dateOfDelivery: newOrder.deliveryDate,
            notifyOnDelivery: newOrder.notifyOnDelivery,
            status: newOrder.status,
        };

        try {
            const response = await fetch('http://localhost:8080/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderToSubmit),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
            }

            const savedOrder = await response.json();
            console.log('Order saved:', savedOrder);

            setOrders((prevOrders) => [...prevOrders, savedOrder]);

            setIsFormVisible(false);

            setNewOrder({
                productName: '',
                productId: '',
                category: '',
                orderValue: '',
                quantity: '',
                unit: '',
                buyingPrice: '',
                deliveryDate: '',
                notifyOnDelivery: false,
                status: 'Confirmed',
            });
        } catch (error) {
            console.error('Error saving order:', error);
        }
    };

    const downloadCSV = (data) => {
        const csvRows = [];
        const headers = Object.keys(data[0]);
        csvRows.push(headers.join(','));

        for (const row of data) {
            const values = headers.map(header => JSON.stringify(row[header]));
            csvRows.push(values.join(','));
        }

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', 'orders.csv');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleDownload = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/orders');
            const data = await response.json();
            downloadCSV(data);
        } catch (error) {
            console.error('Error downloading orders:', error);
        }
    };

    return (
        <>
           
           <div>
                <div className=" bg-gray-100 ml-[210px] xl:ml-[328px] p-1 pt-5 mt-16">
                    <div className="bg-white p-6 rounded-lg shadow-md ">
                        <h2 className="text-xl font-bold mb-4">Overall Orders</h2>
                        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 mb-6">
                            <div className="p-4 bg-blue-100 rounded-lg text-center">
                                <h3 className="text-blue-600 font-bold p-1">Total Orders</h3>
                                <p className="text-2xl font-bold p-1">{totalOrders}</p>
                                <p className="text-gray-500 p-1">Orders</p>
                            </div>
                            <div className="p-4 bg-orange-100 rounded-lg text-center">
                                <h3 className="text-yellow-600 font-bold p-1">Total Received</h3>
                                <div className='flex justify-around p-1'>
                                    <p className="text-2xl font-bold">{totalReceived}</p>
                                    <p className="text-2xl font-bold">₹{totalRevenue}</p>
                                </div>
                                <div className='flex justify-around p-1'>
                                    <p className="text-gray-500 ">Received</p>
                                    <p className="text-gray-500 ">Revenue</p>
                                </div>
                            </div>
                            <div className="p-4 bg-purple-100 rounded-lg text-center ">
                                <h3 className="text-purple-600 font-bold p-1">Total Returned</h3>
                                <div className='flex justify-around p-1'>
                                    <p className="text-2xl font-bold">{totalReturned}</p>
                                    <p className="text-2xl font-bold">₹{totalReturnCost}</p>
                                </div>
                                <div className='flex justify-around p-1'>
                                    <p className="text-gray-500 ">Returned</p>
                                    <p className="text-gray-500 ">Cost</p>
                                </div>
                            </div>
                            <div className="p-4 bg-red-100 rounded-lg text-center ">
                                <h3 className="text-red-600 font-bold p-1">On the way</h3>
                                <div className='flex justify-around p-1'>
                                    <p className="text-2xl font-bold">{onTheWay}</p>
                                    <p className="text-2xl font-bold">₹{onTheWayCost}</p>
                                </div>
                                <div className='flex justify-around p-1'>
                                    <p className="text-gray-500 ">Ordered</p>
                                    <p className="text-gray-500 ">Cost</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-1 bg-gray-100 ml-[210px] xl:ml-[328px] mb-10 ">
                    <div className="bg-white p-6 rounded-lg shadow-md overflow-x-scroll">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold mb-4">Products</h2>
                            <div>
                                <button className="bg-blue-500 text-white px-4 py-2 rounded-3xl mr-2" onClick={() => setIsFormVisible(true)}>Add Product</button>
                                <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-3xl mr-2" onClick={() => setIsSortVisible(true)}>Filters</button>
                                <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-3xl" onClick={handleDownload}>Order history</button>
                            </div>
                        </div>
                
                        <table className="w-full bg-white">
                            <thead>
                                <tr>
                                    <th className="py-2 px-1 border-b text-center">Product Name</th>
                                    <th className="py-2 px-4 border-b text-center">Order Price</th>
                                    <th className="py-2 px-4 border-b text-center">Quantity</th>
                                    <th className="py-2 px-4 border-b text-center">Product ID</th>
                                    <th className="py-2 px-4 border-b text-center">Delivery Date</th>
                                    <th className="py-2 px-4 border-b text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map((order, index) => (
                                    <tr key={order._id}>
                                        <td className="py-2 px-1 border-b text-center">{order.productName}</td>
                                        <td className="py-2 px-4 border-b text-center">₹{order.buyingPrice}</td>
                                        <td className="py-2 px-4 border-b text-center">{order.quantity} Units</td>
                                        <td className="py-2 px-4 border-b text-center">{order.productId}</td>
                                        <td className="py-2 px-4 border-b text-center">{new Date(order.deliveryDate).toLocaleDateString()}</td>
                                        <td className={`py-2 px-4 border-b text-center ${getStatusColor(order.status)}`}>{order.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="flex justify-between items-center mt-4">
                            <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>Previous</button>
                            <p>Page {currentPage} of {pageNumbers.length}</p>
                            <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === pageNumbers.length}>Next</button>

                        </div>
                        <SortPopup
                            isVisible={isSortVisible}
                            onClose={() => setIsSortVisible(false)}
                            onSort={handleSort}
                        />
                        <Popup
                            isVisible={isFormVisible}
                            onClose={() => setIsFormVisible(false)}
                            onSubmit={handleSubmit}
                            newProduct={newOrder}
                            handleInputChange={handleInputChange}
                        />
                    </div >
                </div>
            </div>

        </>
    )
}

const getStatusColor = (status) => {
    switch (status) {
        case 'Confirmed':
            return 'text-green-500';
        case 'Delayed':
            return 'text-yellow-500';
        case 'Out for Delivery':
            return 'text-blue-500';
        case 'Returned':
            return 'text-red-500';
        case 'Reached':
            return 'text-purple-500';
        default:
            return 'text-gray-500';
    }
};

export default Orders;