import React, { useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

interface CustomError {
  message: string;
}

interface VerifyEmailResponse {
  message: string;
}

const VerifyEmailComponent: React.FC = () => {
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const token = query.get('token');

    useEffect(() => {
        const verifyEmail = async () => {
            if (!token) return; // Early return if no token

            try {
                const response = await axios.get<VerifyEmailResponse>(`${process.env.REACT_APP_API_URL}/api/auth/verify-email?token=${token}`);
                alert(response.data.message); // Show success message
                // Optionally redirect to login or home page
            } catch (error: unknown) {
                const customError = error as { message: string };
                console.error(customError.message);
            }
        };

        verifyEmail();
    }, [token]);

    return <div>Verifying your email...</div>;
};

export default VerifyEmailComponent;