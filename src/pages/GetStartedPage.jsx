import { Link } from 'react-router-dom';
import warehouseImg from '../assets/worker.png';

export default function GetStarted() {
    return (
        <div className="flex flex-col lg:flex-row h-screen bg-white">
            {/* Left Section (image + caption) */}
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

            {/* Right Section (text + buttons) */}
            <div className="flex w-full mt-8 lg:mt-0 lg:w-1/2 items-center justify-end lg:justify-center p-2 lg:p-6">
                <div className="w-3/4 lg:2/3 xl:w-1/2">
                    <h1 className="text-2xl md:text-3xl font-semibold mb-4">Get started</h1>
                    <p className="text-gray-500 mb-4 text-xl whitespace-nowrap">
                        Get into your account to do the action
                    </p>

                    <Link
                        to="/register"
                        className="block w-[25rem] mb-4 bg-sky-950 hover:bg-blue-700 text-white font-semibold py-3 rounded transition-colors text-center"
                    >
                        Sign up
                    </Link>
                    <Link
                        to="/login"
                        className="block w-[25rem] border border-sky-950 text-sky-950 hover:bg-blue-50 font-semibold py-3 rounded transition-colors text-center"
                    >
                        Log in
                    </Link>
                </div>
            </div>
        </div>
    );
}
