import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate, useParams } from 'react-router-dom';
import { assets } from '../assets/assets';
import RelatedDoctors from '../components/RelatedDoctors';
import { toast } from 'react-toastify';
import axios from 'axios';

const Appointment = () => {
  const { docId } = useParams();
  const { doctors, currencySymbol, backendUrl, token, getDoctorsData } = useContext(AppContext);
  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

  const navigate = useNavigate()

  const [docInfo, setDocInfo] = useState(null);
  const [docSlots, setDocSlots] = useState([])
  const [slotIndex, setSlotIndex] = useState(0)
  const [slotTime, setSlotTime] = useState('')
  const [loadingSlots, setLoadingSlots] = useState(true)

  // Function to refresh doctor data
  const refreshDoctorData = async () => {
    try {
      // Use cache-busting technique to ensure fresh data
      const response = await axios.get(`${backendUrl}/api/doctor/list`, {
        params: { _: new Date().getTime() }
      });
      
      if (response.data.success) {
        const updatedDoc = response.data.doctors.find(doc => doc._id === docId);
        if (updatedDoc) {
          setDocInfo(prev => ({
            ...prev,
            ...updatedDoc,
            slots_booked: updatedDoc.slots_booked || {}
          }));
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error refreshing doctor data:', error);
      return false;
    }
  };

  const fetchDocInfo = async (forceRefresh = false) => {
    try {
      let docInfo = null;
      
      // Always fetch fresh data for new doctor profiles or when forced
      if (forceRefresh || !doctors.length) {
        const response = await axios.get(`${backendUrl}/api/doctor/list`);
        if (response.data.success) {
          docInfo = response.data.doctors.find(doc => doc._id === docId);
          // Update the context with fresh data
          getDoctorsData();
        }
      } else {
        // Use cached data if available
        docInfo = doctors.find(doc => doc._id === docId);
      }
      
      if (docInfo) {
        setDocInfo(docInfo);
      } else {
        console.error('Doctor not found');
      }
    } catch (error) {
      console.error('Error fetching doctor info:', error);
    }
  };

  const getAvailableSlots = async () => {
    try {
      setLoadingSlots(true);
      setDocSlots([]);

      if (!docInfo) {
        console.log('No doctor info available');
        setLoadingSlots(false);
        return;
      }

      console.log('Generating slots for doctor:', docInfo._id);
      console.log('Current slots_booked:', docInfo.slots_booked);

      let today = new Date();
      const newDocSlots = [];

      for (let i = 0; i < 7; i++) {
        const currentDate = new Date(today);
        currentDate.setDate(today.getDate() + i);
        
        // Format the date to match the backend format (d_m_yyyy)
        const day = currentDate.getDate();
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();
        const dateKey = `${day}_${month}_${year}`;
        
        // Get currently booked slots for this date or empty array if none
        const bookedSlots = (docInfo.slots_booked && docInfo.slots_booked[dateKey]) || [];
        console.log(`Date: ${dateKey}, Booked Slots:`, bookedSlots);

        let startTime = new Date(currentDate);
        let endTime = new Date(currentDate);
        
        // Set end time to 9 PM
        endTime.setHours(21, 0, 0, 0);

        // Set start time (current time + 1 hour if today, or 10 AM if future date)
        if (i === 0) { // Today
          startTime.setHours(startTime.getHours() + 1);
          startTime.setMinutes(startTime.getMinutes() > 30 ? 30 : 0);
        } else { // Future dates
          startTime.setHours(10, 0, 0, 0);
        }

        let timeSlots = [];
        
        // Only add time slots if start time is before end time
        if (startTime < endTime) {
          const slotTime = new Date(startTime);
          
          while (slotTime < endTime) {
            const formattedTime = slotTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            // Check if this time slot is booked
            const isBooked = bookedSlots.some(slot => {
              const slotHour = parseInt(slot.split(':')[0]);
              const slotMinute = parseInt(slot.split(':')[1]);
              return slotHour === slotTime.getHours() && slotMinute === slotTime.getMinutes();
            });
            
            timeSlots.push({
              datetime: new Date(slotTime),
              time: formattedTime,
              dateKey: dateKey,
              isBooked: isBooked
            });

            slotTime.setMinutes(slotTime.getMinutes() + 30);
          }
        }
        
        newDocSlots.push(timeSlots);
      }
      
      console.log('Generated slots:', newDocSlots);
      setDocSlots(newDocSlots);
    } catch (error) {
      console.error('Error in getAvailableSlots:', error);
    } finally {
      setLoadingSlots(false);
    }
  };

  const bookAppointment = async () => {
    if (!token) {
      toast.warn('login to book an appointment')
      return navigate('/login')
    }

    try {
      const date = docSlots[slotIndex][0].datetime

      let day = date.getDate()
      let month = date.getMonth() + 1
      let year = date.getFullYear()

      const slotDate = day + '_' + month + '_' + year
      
      const {data} = await axios.post(backendUrl+ '/api/user/book-appointment',{
        docId,
        slotDate,
        slotTime
      },{
        headers: {
          token
        }
      })

      if(data.success){
        getDoctorsData()
        toast.success('Appointment booked successfully')
        navigate('/my-appointments')
      }else{
        toast.error(data.message)
      }

    } catch (error) {
      console.log(error)
      toast.error(error.response.data.message)
    }
  }

  useEffect(() => {
    // Always try to fetch fresh data when component mounts or docId changes
    const fetchData = async () => {
      await fetchDocInfo(true); // Force refresh when component mounts or docId changes
    };
    fetchData();
  }, [docId]); // Only depend on docId to prevent unnecessary re-fetches

  useEffect(() => {
    console.log('docInfo changed:', docInfo);
    
    if (docInfo) {
      // If slots_booked is not defined, initialize it as an empty object
      const updatedDocInfo = {
        ...docInfo,
        slots_booked: docInfo.slots_booked || {}
      };
      
      // Update the state with the ensured slots_booked
      if (JSON.stringify(updatedDocInfo) !== JSON.stringify(docInfo)) {
        setDocInfo(updatedDocInfo);
      } else {
        // Only fetch slots if we have the required data
        getAvailableSlots();
      }
      
      // Set up interval to refresh doctor data every 30 seconds
      const interval = setInterval(async () => {
        console.log('Refreshing doctor data...');
        await refreshDoctorData();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [docInfo])

  useEffect(() => {
    console.log(docSlots)
  }, [docSlots])

  return docInfo && (
    <div className='mt-4'>
      {/* ----------Doctor Details------------- */}
      <div className='flex flex-col sm:flex-row gap-4'>
        <div>
          <img className='bg-primary w-full sm:max-w-72 rounded-lg' src={docInfo.image} alt="" />
        </div>

        <div className='flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0'>
          {/* --------------Doc Info: name, degree, experience------------ */}
          <p className='flex items-center gap-2 text-2xl font-medium text-gray-900'>
            {docInfo.name}
            <img className='w-5' src={assets.verified_icon} alt="" />
          </p>
          <div className='flex items-center gap-2 text-sm mt-1 text-gray-600'>
            <p>{docInfo.degree} - {docInfo.speciality}</p>
            <button className='py-0.5 px-2 border text-xs rounded-full'>{docInfo.experience}</button>
          </div>
          {/* -------doctor about------------ */}
          <div>
            <p className='flex items-center gap-1 text-sm font-medium text-gray-900 mt-3'>
              About <img src={assets.info_icon} alt="" />
            </p>
            <p className='text-sm text-gray-500 max-w-[700px] mt-1'>{docInfo.about}</p>
          </div>
          <p className='text-gray-500 ont-medium mt-4'>
            Appointment fee: <span className='text-gray-600'>{currencySymbol}{docInfo.fees}</span>
          </p>
        </div>
      </div>

      {/* ------------------------Booking Slots---------------------- */}
      <div className='sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700'>
        <p>Booking slots</p>
        <div className='flex gap-3 items-center w-full overflow-x-scroll mt-4'>
          {
            docSlots.length && docSlots.map((item, index) => (
              <div onClick={() => setSlotIndex(index)}
                className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${slotIndex === index ? 'bg-primary text-white' : 'border border-gray-200'}`}
                key={index}
              >
                <p>{item[0] && daysOfWeek[item[0].datetime.getDay()]}</p>
                <p>{item[0] && item[0].datetime.getDate()}</p>
              </div>
            ))
          }
        </div>
        <div className='flex items-center gap-3 w-full overflow-x-scroll mt-4 min-h-[50px]'>
          {loadingSlots ? (
            <p className='text-gray-500'>Loading available slots...</p>
          ) : docSlots[slotIndex]?.length > 0 ? (
            docSlots[slotIndex].map((item, index) => {
              const isSelected = item.time === slotTime;
              
              return (
                <p 
                  onClick={() => setSlotTime(item.time)} 
                  className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full ${
                    isSelected 
                      ? 'bg-primary text-white cursor-pointer' 
                      : 'text-gray-600 border border-gray-300 cursor-pointer hover:bg-gray-50'
                  }`} 
                  key={index}
                >
                  {item.time.toLowerCase()}
                </p>
              );
            })
          ) : (
            <p className='text-gray-500'>No available slots for this day</p>
          )}
        </div>
        <button onClick={bookAppointment} className='bg-primary text-white text-sm font-light px-14 py-3 rounded-full my-6 '>Book an appointment</button>
      </div>
      {/* ----------Listing Related Doctors -------------- */}
      <RelatedDoctors docId={docId} speciality={docInfo.speciality} />
    </div>
  )
};

export default Appointment;
