import React, { useContext, useEffect, useState } from 'react'
import {AppContext} from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify';


const MyAppointments = () => {
  const { backendUrl, token } = useContext(AppContext)

  const [appointments,setAppointments] = useState([])

  const months =['','JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']

 

  const slotDateFormat = (slotDate) => {
    const dateArray = slotDate.split('-')
    return dateArray[2]+'-'+months[dateArray[1]]+'-'+dateArray[0]
  }
  const formatTime = (time24) => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12; // Convert 0 to 12 for 12 AM
    return `${hour12}:${minutes} ${period}`;
  }
  const getUserAppointments = async () => {
    try {
      console.log('Fetching appointments...');
      const { data } = await axios.get(backendUrl + '/api/user/appointments', {
        headers: { token }
      });
      
      console.log('Appointments API Response:', data);
      
      if (data.success) {
        const reversedAppointments = [...data.appointments].reverse();
        console.log('Reversed appointments:', reversedAppointments);
        setAppointments(reversedAppointments);
      } else {
        console.error('Failed to fetch appointments:', data.message);
        toast.error(data.message || 'Failed to load appointments');
      }
    } catch (error) {
      console.error('Error in getUserAppointments:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch appointments';
      toast.error(errorMessage);
    }
  };

  const [cancellingId, setCancellingId] = useState(null);


  const cancelAppointment = async (appointmentId) => {
    const confirmResult = await new Promise(resolve => {
      toast.info(
        <div>
          <p className="mb-2">Are you sure you want to cancel this appointment?</p>
          <div className="flex gap-2 justify-end mt-3">
            <button 
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
              onClick={() => {
                toast.dismiss();
                resolve(false);
              }}
            >
              No
            </button>
            <button 
              className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
              onClick={() => {
                toast.dismiss();
                resolve(true);
              }}
            >
              Yes, Cancel
            </button>
          </div>
        </div>,
        {
          autoClose: false,
          closeButton: false,
          closeOnClick: false,
          draggable: false
        }
      );
    });

    if (!confirmResult) return;
    
    setCancellingId(appointmentId);
    
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/cancel-appointment`,
        { appointmentId },
        { 
          headers: { 
            'Content-Type': 'application/json',
            'token': token 
          } 
        }
      );
      
      if (data?.success) {
        toast.success('Appointment cancelled successfully');
        // Update the appointment in the list with cancelled status
        setAppointments(prev => 
          prev.map(apt => 
            apt._id === appointmentId ? { ...apt, cancelled: true, cancelledAt: new Date() } : apt
          )
        );
      } else {
        throw new Error(data?.message || 'Failed to cancel appointment');
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to cancel appointment';
      toast.error(errorMessage);
    } finally {
      setCancellingId(null);
    }
  };

  useEffect(()=>{
    if(token){
      getUserAppointments()
    }
  },[token])

  return (
    <div>
      <p className='pb-3 mt-12 font-medium text-zinc-700 border-b'>My Appointments</p>
      <div>
        {appointments.map((item, index) => {
          const isCompleted = item.isCompleted;
          const isCancelled = item.cancelled;
          const showActions = !isCompleted && !isCancelled;
          
          return (
            <div className={`grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b relative ${isCancelled || isCompleted ? 'opacity-70' : ''}`} key={index}>
            {isCompleted && (
              <div className='hidden sm:flex absolute top-2 right-2 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full items-center'>
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="hidden sm:inline">Completed</span>
              </div>
            )}
            {item.cancelled && (
              <div className='hidden sm:inline-block absolute top-2 right-2 bg-red-100 text-red-700 text-xs font-medium px-2.5 py-0.5 rounded-full'>
                Cancelled
              </div>
            )}
            <div className={`relative ${isCancelled || isCompleted ? 'opacity-60' : ''}`}>
              <img className='w-32 bg-indigo-50' src={item.docData.image} alt="" />
              {isCancelled ? (
                <div className='absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center'>
                  <span className='text-white font-bold text-sm rotate-[-20deg]'>CANCELLED</span>
                </div>
              ) : isCompleted && (
                <div className='absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center'>
                  <span className='text-white font-bold text-sm rotate-[-20deg]'>COMPLETED</span>
                </div>
              )}
            </div>
            <div className={`flex-1 text-sm ${isCancelled || isCompleted ? 'text-gray-500' : 'text-zinc-600'}`}>
              <p className={`font-semibold ${isCancelled || isCompleted ? 'text-gray-600' : 'text-neutral-800'}`}>
                {item.docData.name}
                {isCancelled ? (
                  <span className='ml-2 text-xs text-red-600'>(Cancelled)</span>
                ) : isCompleted && (
                  <span className='ml-2 text-xs text-green-600'>(Completed)</span>
                )}
              </p>
              <p>{item.docData.speciality}</p>
              <p className={`font-medium mt-1 ${isCancelled || isCompleted ? 'text-gray-500' : 'text-zinc-700'}`}>Address:</p>
              <p className='text-xs'>{item.userData.address.line1}</p>
              <p className='text-xs'>{item.userData.address.line2}</p>
              {item.userData.gender && (
                <p className='text-xs mt-1'>
                  <span className='text-sm font-medium'>Gender: </span>
                  {item.userData.gender}
                </p>
              )}
              <p className='text-xs mt-1'>
                <span className={`text-sm ${isCancelled || isCompleted ? 'text-gray-600' : 'text-neutral-700'} font-medium`}>
                  Date & Time:
                </span>{' '}
                {slotDateFormat(item.slotDate)} | {formatTime(item.slotTime)}
                {(isCancelled && item.cancelledAt) || (isCompleted && item.completedAt) ? (
                  <span className={`block text-xs mt-1 ${isCancelled ? 'text-red-600' : 'text-green-600'}`}>
                    {isCancelled ? 'Cancelled' : 'Completed'} on: {new Date(isCancelled ? item.cancelledAt : item.completedAt).toLocaleString()}
                  </span>
                ) : null}
              </p>
            </div>
            <div className='flex flex-col gap-2 justify-end w-full sm:w-auto'>
              <button 
                className={`w-full sm:w-32 text-sm text-center py-2 px-4 border rounded transition-all duration-300 ${
                  isCancelled || isCompleted
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'text-stone-500 hover:bg-primary hover:text-white'
                }`}
                disabled={isCancelled || isCompleted}
              >
                {isCancelled ? 'Payment Cancelled' : isCompleted ? 'Payment Completed' : 'Pay Online'}
              </button>
              <button 
                onClick={() => !isCancelled && !isCompleted && cancelAppointment(item._id)}
                disabled={isCancelled || isCompleted || cancellingId === item._id}
                className={`w-full sm:w-32 text-sm text-center py-2 px-4 border rounded transition-all duration-300 ${
                  isCancelled || isCompleted
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                    : cancellingId === item._id
                      ? 'bg-gray-300 text-gray-600 cursor-wait'
                      : 'text-stone-500 hover:bg-red-600 hover:text-white hover:border-transparent'
                }`}
              >
                {cancellingId === item._id ? 'Cancelling...' : isCancelled ? 'Cancelled' : 'Cancel'}
              </button>
            </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyAppointments;
