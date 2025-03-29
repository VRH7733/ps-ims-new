// PS-IMS-NEW-FE/src/components/DashBoard.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Chart, registerables } from 'chart.js';

// Icons
import { FaHome, FaTimesCircle, FaShoppingBag, FaBox, FaChartBar, FaChartLine, FaList } from 'react-icons/fa';
import { FaPeopleGroup } from 'react-icons/fa6';
import { GiReceiveMoney } from 'react-icons/gi';
import { FaTruck } from 'react-icons/fa6';

Chart.register(...registerables);

const DashBoard = () => {
    const barChartRef = useRef(null);
    const pieChartRef = useRef(null);

    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // 1) Get token from localStorage
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No token found - Please login first.');
                }

                // 2) Make fetch call with Bearer token
                const res = await fetch('http://localhost:8080/api/dashboard', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!res.ok) {
                    throw new Error('Failed to retrieve dashboard data');
                }

                const data = await res.json();
                setDashboardData(data || {});
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    useEffect(() => {
        if (!dashboardData) return;

        let barChart;
        let pieChart;

        const salesObj = dashboardData.salesOverview?.[0] || {};
        const purchaseObj = dashboardData.purchaseOverview?.[0] || {};

        // Bar Chart
        if (barChartRef.current) {
            const barCtx = barChartRef.current.getContext('2d');
            barChart = new Chart(barCtx, {
                type: 'bar',
                data: {
                    labels: ['Sales', 'Purchase'],
                    datasets: [
                        {
                            label: 'Overview',
                            data: [
                                salesObj.sales || 0,
                                purchaseObj.purchase || 0
                            ],
                            backgroundColor: ['rgba(10, 34, 64, 1)', '#5F6FFF'],
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }

        // Pie (Line) Chart
        if (pieChartRef.current) {
            const pieCtx = pieChartRef.current.getContext('2d');
            pieChart = new Chart(pieCtx, {
                type: 'line',
                data: {
                    labels: ['Revenue', 'Profit', 'Cost'],
                    datasets: [
                        {
                            label: 'Sales Overview',
                            data: [
                                salesObj.revenue || 0,
                                salesObj.profit || 0,
                                salesObj.cost || 0
                            ],
                            backgroundColor: 'rgba(54, 162, 235, 0.2)',
                            borderColor: 'rgba(21, 112, 239, 1)',
                            borderWidth: 2,
                            fill: true,
                            tension: 0.4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: { beginAtZero: true }
                    }
                }
            });
        }

        // Cleanup on unmount
        return () => {
            if (barChart) barChart.destroy();
            if (pieChart) pieChart.destroy();
        };
    }, [dashboardData]);

    if (loading) {
        return <div className="mt-20 ml-[210px]">Loading dashboard...</div>;
    }

    if (error) {
        return <div className="mt-20 ml-[210px] text-red-500">Error: {error}</div>;
    }

    if (!dashboardData) {
        return <div className="mt-20 ml-[210px]">No dashboard data available.</div>;
    }

    // Now we can safely use the data
    const sales = dashboardData.salesOverview?.[0] || {};
    const purchase = dashboardData.purchaseOverview?.[0] || {};
    const inventory = dashboardData.inventory?.[0] || {};
    const productSummary = dashboardData.productSummary?.[0] || {};
    const topSellingStock = dashboardData.topSellingStock || [];
    const lowQuantityStock = dashboardData.lowQuantityStock || [];

    return (
        <div className="space-y-4 mt-20 ml-[210px] xl:ml-[328px] p-1">
            {/* 1) Sales Overview */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-2">Sales Overview</h2>
                    <div className="flex justify-around items-center">
                        <div className="text-center justify-items-center">
                            <GiReceiveMoney className="text-2xl text-gray-500" />
                            <p className="text-xl font-semibold">{sales.sales ?? 0}</p>
                            <p className="text-gray-500">Sales</p>
                        </div>
                        <div className="text-center justify-items-center">
                            <FaChartLine className="text-2xl text-purple-500" />
                            <p className="text-xl font-semibold">₹ {sales.revenue ?? 0}</p>
                            <p className="text-gray-500">Revenue</p>
                        </div>
                        <div className="text-center justify-items-center">
                            <FaChartBar className="text-2xl text-orange-500" />
                            <p className="text-xl font-semibold">₹ {sales.profit ?? 0}</p>
                            <p className="text-gray-500">Profit</p>
                        </div>
                        <div className="text-center justify-items-center">
                            <FaHome className="text-2xl text-green-500" />
                            <p className="text-xl font-semibold">₹ {sales.cost ?? 0}</p>
                            <p className="text-gray-500">Cost</p>
                        </div>
                    </div>
                </div>

                {/* 2) Inventory Summary */}
                <div className="bg-white p-4 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-2">Inventory Summary</h2>
                    <div className="flex justify-around items-center">
                        <div className="text-center justify-items-center">
                            <FaBox className="text-2xl text-orange-500" />
                            <p className="text-xl font-semibold">
                                {inventory.quantityInHand ?? 0}
                            </p>
                            <p className="text-gray-500">Quantity in Hand</p>
                        </div>
                        <div className="text-center justify-items-center">
                            <FaTruck className="text-2xl text-purple-500" />
                            <p className="text-xl font-semibold">
                                {inventory.toBeReceived ?? 0}
                            </p>
                            <p className="text-gray-500">To be received</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3) Purchase Overview & Product Summary */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-2">Purchase Overview</h2>
                    <div className="flex justify-around items-center">
                        <div className="text-center justify-items-center">
                            <FaShoppingBag className="text-2xl text-blue-500" />
                            <p className="text-xl font-semibold">{purchase.purchase ?? 0}</p>
                            <p className="text-gray-500">Purchase</p>
                        </div>
                        <div className="text-center justify-items-center">
                            <FaHome className="text-2xl text-green-500" />
                            <p className="text-xl font-semibold">₹ {purchase.cost ?? 0}</p>
                            <p className="text-gray-500">Cost</p>
                        </div>
                        <div className="text-center justify-items-center">
                            <FaTimesCircle className="text-2xl text-purple-500" />
                            <p className="text-xl font-semibold">{purchase.cancel ?? 0}</p>
                            <p className="text-gray-500">Cancel</p>
                        </div>
                        <div className="text-center justify-items-center">
                            <FaChartBar className="text-2xl text-orange-500" />
                            <p className="text-xl font-semibold">{purchase.return ?? 0}</p>
                            <p className="text-gray-500">Return</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-2">Product Summary</h2>
                    <div className="flex justify-around items-center">
                        <div className="text-center justify-items-center">
                            <FaPeopleGroup className="text-2xl text-gray-500" />
                            <p className="text-xl font-semibold">
                                {productSummary.numberOfSuppliers ?? 0}
                            </p>
                            <p className="text-gray-500">Number of Suppliers</p>
                        </div>
                        <div className="text-center justify-items-center">
                            <FaList className="text-2xl text-purple-500" />
                            <p className="text-xl font-semibold">
                                {productSummary.numberOfCategories ?? 0}
                            </p>
                            <p className="text-gray-500">Number of Categories</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4) Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {/* Bar Chart */}
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Sales & Purchase</h2>
                        <button className="bg-gray-200 p-2 rounded-lg text-sm">Weekly</button>
                    </div>
                    <div className="chart" id="bar">
                        <h3 className="text-purple-900 text-2xl font-bold">Today's data</h3>
                        <canvas ref={barChartRef} id="barChart" style={{ maxHeight: '400px' }}></canvas>
                    </div>
                </div>

                {/* Pie (Line) Chart */}
                <div className="bg-white p-4 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                    <div className="chart" id="pie">
                        <h3 className="text-purple-900 text-2xl font-bold">Top Selling Products</h3>
                        <canvas ref={pieChartRef} id="pieChart" style={{ maxHeight: '400px' }}></canvas>
                    </div>
                </div>
            </div>

            {/* 5) Top Selling Stock & Low Quantity Stock */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {/* Top Selling Stock */}
                <div className="bg-white p-4 rounded-lg shadow mb-1">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Top Selling Stock</h2>
                        <a href="#" className="text-blue-500">See All</a>
                    </div>
                    <table className="w-full text-left">
                        <thead>
                            <tr>
                                <th className="py-2">Name</th>
                                <th className="py-2">Sold Quantity</th>
                                <th className="py-2">Remaining Quantity</th>
                                <th className="py-2">Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topSellingStock.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="py-2">{item.name}</td>
                                    <td className="py-2">{item.soldQuantity}</td>
                                    <td className="py-2">{item.remainingQuantity}</td>
                                    <td className="py-2">₹ {item.price}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Low Quantity */}
                <div className="bg-white p-4 rounded-lg shadow mb-10 lg:mb-1">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Low Quantity Stock</h2>
                        <a href="#" className="text-blue-500">See All</a>
                    </div>
                    {lowQuantityStock.map((item, idx) => (
                        <div key={idx} className="flex items-center mb-3">
                            <img
                                src="https://placehold.co/50x50"
                                alt="Stacked boxes"
                                className="w-12 h-12 mr-4"
                            />
                            <div>
                                <h3 className="text-md font-semibold">{item.name}</h3>
                                <p className="text-sm text-gray-500">
                                    Remaining Quantity: {item.remainingQuantity}
                                </p>
                            </div>
                            <span className="ml-auto bg-red-100 text-red-500 text-xs font-semibold px-2 py-1 rounded-full">
                                Low
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DashBoard;
