// src/pages/Register.jsx
import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import validator from 'validator'
import Swal from 'sweetalert2'
import warehouseImg from '../assets/worker.png'

export default function Register() {
    const navigate = useNavigate()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [clientErrors, setClientErrors] = useState({})

    // Validation logic
    const runValidations = () => {
        const errors = {}
        if (email.trim().length === 0) {
            errors.email = 'Email is required'
        } else if (!validator.isEmail(email)) {
            errors.email = 'Invalid email format'
        }
        if (password.trim().length === 0) {
            errors.password = 'Password is required'
        } else if (password.trim().length < 8 || password.trim().length > 128) {
            errors.password = 'Password should be between 8 - 128 characters'
        }
        if (confirmPassword.trim().length === 0) {
            errors.confirmPassword = 'Confirm password is required'
        } else if (confirmPassword !== password) {
            errors.confirmPassword = 'Passwords do not match'
        }
        setClientErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const isValid = runValidations();

        if (isValid) {
            try {
                const response = await axios.post(
                    'http://localhost:8080/api/users/register',
                    { email, password, confirmPassword },
                    { headers: { "Content-Type": "application/json" } }
                );

                navigate('/app'); // Redirect only if successful

                Swal.fire({
                    title: 'Success!',
                    text: 'Registration completed successfully.',
                    icon: 'success',
                    confirmButtonText: 'OK'
                });
            } catch (error) {
                console.error("Registration error:", error.response?.data || error.message);

                Swal.fire({
                    title: 'Error!',
                    text: error.response?.data?.message || 'Something went wrong. Please try again.',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        }
    };



    return (
        <div className="flex flex-col lg:flex-row h-screen bg-white">
            <div className="relative hidden lg:block w-full lg:w-1/2 h-screen">
                <img
                    src={warehouseImg}
                    alt="Warehouse worker organizing inventory"
                    className="w-full h-screen object-cover rounded-lg"
                />
                <div className="absolute bottom-4 left-4 text-white text-base sm:text-lg md:text-xl font-semibold drop-shadow-lg max-w-[80%] text-center">
                    Inventory is a great platform for online or offline stores like ours
                </div>
            </div>

            <div className="flex w-full lg:w-1/2 items-center justify-center p-6 lg:p-12">
                <div className="w-3/4 lg:2/3 xl:w-1/2">
                    <h2 className="text-3xl font-bold mb-2">Sign Up</h2>
                    <p className="text-xl text-gray-500 mb-4">
                        Don’t have account
                    </p>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <input
                                type="email"
                                placeholder="Email ID"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full border border-gray-500 px-3 py-2 rounded focus:outline-none focus:ring focus:ring-gray-800 transition duration-200"
                                required
                            />
                            {clientErrors.email && <p className="text-red-500">{clientErrors.email}</p>}
                        </div>

                        <div className="mb-4">
                            <input
                                type="password"
                                placeholder="Enter Password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full border border-gray-500 px-3 py-2 rounded focus:outline-none focus:ring focus:ring-gray-800 transition duration-200"
                                required
                            />
                            {clientErrors.password && <p className="text-red-500">{clientErrors.password}</p>}
                        </div>

                        <div className="mb-4">
                            <input
                                type="password"
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                className="w-full border border-gray-500 px-3 py-2 rounded focus:outline-none focus:ring focus:ring-gray-800 transition duration-200"
                                required
                            />
                            {clientErrors.confirmPassword && <p className="text-red ```jsx
                -500">{clientErrors.confirmPassword}</p>}
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-700 transition duration-200"
                        >
                            Register
                        </button>
                    </form>
                    <p className="mt-4 text-center">
                        Already have an account? <Link to="/login" className="text-blue-500">Login here</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}