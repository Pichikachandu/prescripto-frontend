import React from 'react'
import { assets } from '../assets/assets'

const Footer = () => {
    return (
        <div className='md:mx-10'>
            <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>
                {/* -----------Left section */}
                <div>
                    <p className='text-2xl font-medium flex items-center gap-1 mb-5'>
                        <span className='material-symbols-outlined text-blue-500'>radio_button_checked</span>
                        Doc<span className='text-blue-500 font-medium text-2xl'>Spot!</span>
                    </p>
                    <p className='w-full md:w-2/3 text-gray-600 leading-6'>DocSpot! makes healthcare accessible with seamless appointment booking. Connect with trusted doctors, schedule visits at your convenience, and manage your health journey with ease. Experience the future of healthcare today.</p>
                </div>
                {/* -----------center section */}
                <div>
                    <p className='text-xl font-medium mb-5'>COMPANY</p>
                    <ul className='flex flex-col gap-2 text-gray-600'>
                        <li>Home</li>
                        <li>About us</li>
                        <li>Contact us</li>
                        <li>Privacy policy</li>
                    </ul>
                </div>
                {/* -----------right section */}
                <div>
                    <p className='text-xl font-medium mb-5'>GET IN TOUCH</p>
                    <ul className='flex flex-col gap-2 text-gray-600'>
                        <li>+91 XXXXXXXXXX</li>
                        <li>DocSpot@gmail.com</li>
                    </ul>
                </div>
            </div>
            <div>
                {/* --------Copyright Text----------- */}
                <div>
                    <hr />
                    <p className='py-5 text-sm text-center'>Copyright 2025@ Prescripto -All Rights Reserved</p>
                </div>
            </div>
        </div>
    )
}

export default Footer
