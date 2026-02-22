import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth } from '../components/Auth';

export const AuthPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Auth 
            onLoginSuccess={() => navigate(-1)} 
            onTrainerLogin={() => navigate('/trainer-portal')} 
        />
    );
};
