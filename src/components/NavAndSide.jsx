import React, { useState, useEffect, useRef } from 'react';
import { IoSpeedometer } from "react-icons/io5";
import { FaBox, FaShoppingCart, FaTags, FaFileInvoice } from "react-icons/fa";
import bell from '../assets/images/bell.png';
import searchIcon from '../assets/images/vector.png';
// default fallback avatar
import defaultProfilePic from '../assets/images/profile-pic.jpg';
import { AiOutlineRise } from 'react-icons/ai';
import { NavLink, useNavigate } from 'react-router-dom';
import { PiCubeFocusFill } from 'react-icons/pi';
import { CiLogout } from 'react-icons/ci';
import { TbReportAnalytics } from "react-icons/tb";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera } from "@fortawesome/free-solid-svg-icons";
import ManageStock from './ManageStock';

// Profile Card
const ProfileCard = ({
    isVisible,
    onClose,
    profileData,
    isEditing,
    handleEditProfile,
    handleSaveProfile,
    handleProfilePictureChange,
    handleChange
}) => {
    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-96 max-w-full">
                {/* Profile Picture */}
                <div className="flex justify-center">
                    <div className="relative">
                        <img
                            src={profileData.profilePicture || defaultProfilePic}
                            alt="Profile"
                            className="w-24 h-24 rounded-full border-4 border-gray-300 object-cover shadow-lg"
                        />
                        {isEditing && (
                            <label className="absolute bottom-0 right-0 bg-blue-500 text-white text-xs p-2 rounded-full cursor-pointer shadow-md">
                                <FontAwesomeIcon icon={faCamera} />
                                <input
                                    type="file"
                                    className="hidden"
                                    onChange={handleProfilePictureChange}
                                />
                            </label>
                        )}
                    </div>
                </div>

                {/* Profile Details */}
                <div className="mt-4 text-center">
                    {isEditing ? (
                        <input
                            type="text"
                            name="name"
                            value={profileData.name || ''}
                            onChange={handleChange}
                            className="text-xl font-bold text-gray-800 border rounded p-1 w-full"
                        />
                    ) : (
                        <h2 className="text-xl font-bold text-gray-800">{profileData.name}</h2>
                    )}
                </div>

                {/* Profile Information */}
                <div className="mt-4 space-y-2">
                    {/* Phone row */}
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-500">Phone:</span>
                        {isEditing ? (
                            <input
                                type="text"
                                name="phoneNumber"
                                value={profileData.phoneNumber || ''}
                                onChange={handleChange}
                                className="border p-1 rounded w-2/3"
                            />
                        ) : (
                            <span className="text-gray-800">{profileData.phoneNumber}</span>
                        )}
                    </div>
                    {/* Email row */}
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-500">Email:</span>
                        {isEditing ? (
                            <input
                                type="email"
                                name="email"
                                value={profileData.email || ''}
                                onChange={handleChange}
                                className="border p-1 rounded w-2/3"
                            />
                        ) : (
                            <span className="text-gray-800">{profileData.email}</span>
                        )}
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end mt-5">
                    {isEditing ? (
                        <button
                            type="button"
                            onClick={handleSaveProfile}
                            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all"
                        >
                            Save
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleEditProfile}
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all"
                        >
                            Edit
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={onClose}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg ml-2 hover:bg-gray-400 transition-all"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

const NavAndSide = () => {
    const navigate = useNavigate();
    const [isProfileCardVisible, setIsProfileCardVisible] = useState(false);
    const [isNotificationCardVisible, setIsNotificationCardVisible] = useState(false);
    const [notifications, setNotifications] = useState([]);

    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState({
        name: '',
        phoneNumber: '',
        email: '',
        profilePicture: ''
    });

    // Searching
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchDropdown, setShowSearchDropdown] = useState(false);
    const searchRef = useRef(null);

    // ---- 1) Fetch user profile after mounting -----------
    useEffect(() => {
        getUserProfile();
    }, []);

    const getUserProfile = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('No token found in localStorage. User not logged in.');
            return;
        }

        try {
            const res = await fetch('http://localhost:8080/api/users/account', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) throw new Error('Failed to fetch user profile');
            const updatedUser = await res.json(); // from server
            console.log('User profile:', updatedUser);
            setProfileData(prev => ({
                ...prev,
                name: updatedUser.name || '',
                email: updatedUser.email || '',
                phoneNumber: updatedUser.phone || '',
                profilePicture: updatedUser.profileUrl || ''
            }));

        } catch (err) {
            console.error('Error fetching user profile:', err);
        }
    };

    // 2) Edit / Save profile
    const handleEditProfile = () => {
        setIsEditing(true);
    };

    const handleSaveProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('No token, please login first.');
                return;
            }

            const formData = new FormData();
            formData.append('name', profileData.name || '');
            formData.append('email', profileData.email || '');
            formData.append('phone', profileData.phoneNumber || '');

            // if uploading a new pic
            if (profileData.profilePictureFile) {
                formData.append('profilePic', profileData.profilePictureFile);
            }

            const res = await fetch('http://localhost:8080/api/users/updateUser', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!res.ok) throw new Error('Failed to update profile');
            const updatedUser = await res.json();

            setProfileData(prev => ({
                ...prev,
                name: updatedUser.name || '',
                email: updatedUser.email || '',
                phoneNumber: updatedUser.phone || '',
                profilePicture: updatedUser.profileUrl || ''
            }));

            setIsEditing(false);
            setIsProfileCardVisible(false);
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile');
        }
    };

    // 3) Handle new profile picture
    const handleProfilePictureChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        setProfileData(prev => ({
            ...prev,
            profilePictureFile: file,
            profilePicture: URL.createObjectURL(file)
        }));
    };

    // 4) handleChange for text fields
    const handleChange = (e) => {
        setProfileData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    // Notifications logic
    const fetchOutForDeliveryOrders = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/orders?status=Out for Delivery');
            const data = await response.json();
            setNotifications(data);
        } catch (error) {
            console.error('Error fetching out for delivery orders:', error);
        }
    };

    // Searching logic
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowSearchDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchSearch = async () => {
            if (!searchTerm.trim()) {
                setSearchResults([]);
                setShowSearchDropdown(false);
                return;
            }
            try {
                const res = await fetch(`http://localhost:8080/api/search?query=${encodeURIComponent(searchTerm)}`);
                if (!res.ok) throw new Error('Search failed');
                const data = await res.json();
                setSearchResults(data);
                setShowSearchDropdown(true);
            } catch (error) {
                console.error(error);
            }
        };
        const timer = setTimeout(() => fetchSearch(), 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleResultClick = (result) => {
        setShowSearchDropdown(false);
        setSearchTerm('');
        navigate(result.route);
    };

    const handleBellClick = () => {
        setIsNotificationCardVisible(!isNotificationCardVisible);
        if (!isNotificationCardVisible) {
            fetchOutForDeliveryOrders();
        }
    };

    // Nav items
    const navItems = [
        { to: '/app', label: 'Dashboard', icon: <IoSpeedometer /> },
        { to: '/app/inventory-dashboard', label: 'Inventory', icon: <FaBox /> },
        { to: '/app/reports', label: 'Reports', icon: <FaTags /> },
        { to: '/app/suppliers', label: 'Suppliers', icon: <TbReportAnalytics /> },
        { to: '/app/orders', label: 'Orders', icon: <AiOutlineRise /> },
        { to: '/app/stores', label: 'Manage Store', icon: <FaShoppingCart /> },
        { to: '/app/billing', label: 'Billing', icon: <FaFileInvoice /> },
        {
            to: "/app/manage-stock",
            label: 'ManageStock',
            icon: <IoSpeedometer />
        }
    ];

    return (
        <div className="flex">
            {/* Sidebar */}
            <div className="bg-[#0A2240] h-screen w-[204px] xl:w-[320px] p-5 fixed">
                <div>
                    <NavLink to="/app" className="flex items-center mt-5 mb-5 justify-center">
                        <PiCubeFocusFill className="text-[#1570EF] text-4xl mr-2" />
                        <span className="text-[#1570EF] text-2xl">Inventory</span>
                    </NavLink>
                    <nav>
                        {navItems.map(({ to, label, icon, special }, index) => (
                            <NavLink
                                key={index}
                                to={to}
                                className={({ isActive }) =>
                                    `${isActive ? 'text-white' : special ? 'text-[#FF0000]' : 'text-[#949494]'}
                  flex items-center p-4 hover:text-white transition duration-300 mt-5 justify-center`
                                }
                            >
                                <span className="text-[#1570EF] text-2xl mr-2">{icon}</span>
                                <span>{label}</span>
                            </NavLink>
                        ))}
                    </nav>
                </div>
                <NavLink
                    to="/get-started"
                    className="flex items-center p-4 mt-[10rem] hover:text-white transition duration-300 justify-center text-[#FF0000]"
                >
                    <CiLogout className="text-[#1570EF] text-2xl mr-2" />
                    <span>Logout</span>
                </NavLink>
            </div>

            {/* Main Content */}
            <div className="flex-1 ml-[204px] xl:ml-[320px] bg-white">
                <header className="flex justify-between items-center p-4 shadow-md fixed top-0 left-[204px] xl:left-[320px] right-0 bg-white z-10">
                    {/* Search */}
                    <div className="relative flex items-center" ref={searchRef}>
                        <input
                            type="text"
                            placeholder="Search..."
                            className="border rounded-3xl p-2 pl-10 w-96"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onFocus={() => {
                                if (searchResults.length > 0) setShowSearchDropdown(true);
                            }}
                        />
                        <img src={searchIcon} alt="Search" className="absolute left-3 w-5 h-5" />

                        {/* Search Dropdown */}
                        {showSearchDropdown && searchResults.length > 0 && (
                            <div className="absolute top-12 left-0 w-96 bg-white border border-gray-300 rounded shadow z-50">
                                {searchResults.map((result, idx) => (
                                    <div
                                        key={idx}
                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                        onClick={() => handleResultClick(result)}
                                    >
                                        <p className="text-sm">
                                            <span className="font-bold">{result.type}</span>: {result.name}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                        {showSearchDropdown && searchTerm && searchResults.length === 0 && (
                            <div className="absolute top-12 left-0 w-96 bg-white border border-gray-300 rounded shadow z-50 px-4 py-2">
                                No results found
                            </div>
                        )}
                    </div>

                    {/* Notifications & Profile */}
                    <div className="flex items-center">
                        <img
                            src={bell}
                            alt="Notifications"
                            className="w-4 h-4 mr-4 cursor-pointer"
                            onClick={handleBellClick}
                        />
                        <img
                            src={profileData.profilePicture || defaultProfilePic}
                            alt="Profile"
                            className="w-8 h-8 rounded-full cursor-pointer"
                            onClick={() => setIsProfileCardVisible(true)}
                        />
                    </div>
                </header>

                {/* Notifications Card */}
                {isNotificationCardVisible && (
                    <div className="fixed top-16 right-4 bg-white p-4 rounded-lg shadow-lg w-80 z-20">
                        <h3 className="text-lg font-bold mb-2">Out for Delivery</h3>
                        <ul>
                            {notifications.length > 0 ? (
                                notifications.map(notification => (
                                    <li key={notification._id} className="border-b py-2">
                                        {notification.productName}
                                    </li>
                                ))
                            ) : (
                                <li className="py-2">No orders out for delivery</li>
                            )}
                        </ul>
                    </div>
                )}

                {/* Profile Card */}
                <ProfileCard
                    isVisible={isProfileCardVisible}
                    onClose={() => setIsProfileCardVisible(false)}
                    profileData={profileData}
                    isEditing={isEditing}
                    handleEditProfile={() => setIsEditing(true)}
                    handleSaveProfile={handleSaveProfile}
                    handleProfilePictureChange={handleProfilePictureChange}
                    handleChange={handleChange}
                />
            </div>
        </div>
    );
};

export default NavAndSide;
