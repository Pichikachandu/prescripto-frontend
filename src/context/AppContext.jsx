import { createContext, useEffect, useState } from "react";
import axios from 'axios'
import { toast } from 'react-toastify'

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {  // Accept children as a prop

    const currencySymbol = "₹"
    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const [doctors, setDoctors] = useState([])
    const [token, setToken] = useState(localStorage.getItem('token')?localStorage.getItem('token'): false)
    const [userData, setUserData] = useState(false)


    const getDoctorsData = async () => {
        try {
            console.log('Fetching doctors from:', backendUrl + '/api/doctor/list');
            const response = await axios.get(backendUrl + '/api/doctor/list', {
                withCredentials: true
            });
            console.log('Doctors data received:', response.data);

            if (response.data && response.data.success) {
                setDoctors(response.data.doctors || []);
            } else {
                const errorMsg = response.data?.message || 'Failed to fetch doctors';
                console.error('Error in response:', errorMsg);
                toast.error(errorMsg);
            }
        } catch (error) {
            console.error('Error fetching doctors:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Failed to connect to server';
            toast.error(errorMsg);

            // Log more details for debugging
            if (error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response data:', error.response.data);
            }
        }
    }

    const loadUserProfileData = async () => {
        try{
            const {data} = await axios.get(backendUrl + '/api/user/get-profile', {
                headers:{token}
            });
            console.log('User profile data received:', data);

            if (data && data.success) {
                setUserData(data.user || []);
            } else {
                const errorMsg = data?.message || 'Failed to fetch user profile';
                console.error('Error in response:', errorMsg);
                toast.error(errorMsg);
            }
        } catch(error){
            console.log(error)
            toast.error(error.message)
        }
    }

    const value = {
        doctors, currencySymbol, token, setToken, backendUrl, userData,setUserData,loadUserProfileData,getDoctorsData
    };


    useEffect(() => {
        getDoctorsData()
    }, [])

    useEffect(() => {
        if(token){
            loadUserProfileData()
        } else{
            setUserData(false)
        }
    }, [token])

    return (
        <AppContext.Provider value={value}>
            {children}  {/* Use children prop */}
        </AppContext.Provider>
    );
};

export default AppContextProvider;
