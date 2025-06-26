import React from 'react'
import { assets } from '../assets/assets'


const About = () => {
  return (
    <div>
      <div className='text-center text-2xl pt-10 text-gray-500'>
        <p>ABOUT <span className='text-gray-700 font-medium'>US</span></p>
      </div>

      <div className='my-10 flex flex-col md:flex-row gap-12'>
        {/* Image Section */}
        <div className="md:w-1/2">
          <img className='w-full md:max-w-[370px]' src={assets.about_image} alt="About Prescripto" />
        </div>

        {/* Text Section */}
        <div className="flex flex-col justify-center gap-6 md:w-3/4 text-sm text-gray-600">
          <p>
            Welcome to <b>DocSpot!</b>, your trusted partner in connecting patients with healthcare providers. We understand the challenges of finding the right doctor and scheduling appointments that fit your busy lifestyle. Our platform is designed to make healthcare accessible, convenient, and stress-free for everyone.
          </p>
          <p>
            At DocSpot!, we're committed to revolutionizing healthcare access through technology. Our platform seamlessly connects you with qualified doctors, allowing you to book appointments with just a few clicks. Whether you need a routine check-up, specialist consultation, or ongoing care, we're here to support your health journey every step of the way.
          </p>
          <b className="text-grey-800">Our Vision</b>
          <p>
            We envision a world where quality healthcare is just a tap away. By bridging the gap between patients and healthcare providers, we're creating a future where everyone has easy access to the medical care they need, when they need it most. Our mission is to make healthcare more accessible, efficient, and patient-centered through innovative technology.
          </p>
        </div>
      </div>

      <div className='text-xl my-4'>
        <p>WHY <span className='text-gray-700 font-semibold'>CHOOSE US</span></p>
      </div>

      <div className='flex flex-col md:flex-row mb-20'>
        <div className='border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer'>
          <b>Efficiency:</b>
          <p>Streamlined Appointment Scheduling That Fits Into Your Busy Lifestyle</p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer'>
          <b>Convenience:</b>
          <p>Access To A Network Of Trusted Healthcare Professionals In Your Area.</p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer'>
          <b>Personalization:</b>
          <p>Tailored Recommendations And Reminders To Help You Stay On Top Of Your Health.</p>
        </div>
      </div>
    </div>

  )
}

export default About
