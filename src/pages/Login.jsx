// src/pages/Login.jsx
import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import Swal from 'sweetalert2'
import warehouseImg from '../assets/worker.png'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [clientErrors, setClientErrors] = useState({})

  // Validation logic
  const runValidations = () => {
    const errors = {}
    if (email.trim().length === 0) {
      errors.email = 'Email is required'
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      errors.email = 'Invalid email format'
    }
    if (password.trim().length === 0) {
      errors.password = 'Password is required'
    } else if (password.trim().length < 8 || password.trim().length > 128) {
      errors.password = 'Password should be between 8 - 128 characters'
    }
    setClientErrors(errors)
    return Object.keys(errors).length === 0
  }

  // In your handleSubmit in Login.jsx:

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = runValidations();

    if (isValid) {
      try {
        const response = await axios.post(
          'http://localhost:8080/api/users/login',
          { email, password },
          { withCredentials: true }
        );

        // Typically, the server returns: { token: '...' }
        const { token } = response.data;

        // 1) Store token in localStorage
        localStorage.setItem('token', response.data.token);

        // 2) Then redirect
        navigate('/app');

        Swal.fire({
          title: 'Success!',
          text: 'Login completed successfully.',
          icon: 'success',
          confirmButtonText: 'OK'
        });
      } catch (error) {
        Swal.fire({
          title: 'Error!',
          text: 'Invalid email or password!',
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
          <h2 className="text-3xl font-bold mb-2">Login</h2>
          <p className="text-xl text-gray-500 mb-4">
            I am already a member at inventory
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

            <button
              type="submit"
              className="w-full bg-sky-950 text-white py-2 rounded hover:bg-blue-700 transition"
            >
              Login
            </button>
          </form>

          <p className="mt-4 text-center">
            Don't have an account?{' '}
            <Link to="/register" className="text-sky-950 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}