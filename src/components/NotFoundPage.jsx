import React from 'react';
import { Link } from 'react-router-dom';
import { FaExclamationTriangle } from 'react-icons/fa';

const NotFoundPage = () => {
    return (
        <section className="flex flex-col justify-center items-center h-screen text-center ">
            <FaExclamationTriangle className='text-yellow-400 text-6xl mb-4' />
            <h1 className="text-4xl md:text-6xl font-bold mb-4">404 Not Found</h1>
            <p className="text-lg md:text-xl mb-5">This page does not exist</p>
            <Link
                to="/app"
                className="text-white bg-indigo-700 hover:bg-indigo-900 rounded-md px-4 py-2 mt-4 transition duration-300"
            >
                Go Back
            </Link>
        </section>
    );
};

export default NotFoundPage;