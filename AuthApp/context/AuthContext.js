import React, { createContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CLIENT_IP, PORT } from '@env';
import NetInfo from '@react-native-community/netinfo';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(null);
    const [username, setUsername] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const checkNetwork = async () => {
        const networkState = await NetInfo.fetch();
        if (!networkState.isConnected) {
            throw new Error('No internet connection');
        }
    };

    const validateServerUrl = () => {
        if (!CLIENT_IP || !PORT) {
            throw new Error('Server configuration missing');
        }
    };

    const login = async (username, password) => {
        try {
            setError(null);
            
            // Validate inputs
            if (!username || !password) {
                throw new Error('Username and password are required');
            }

            // Check network connection
            await checkNetwork();
            
            // Validate server configuration
            validateServerUrl();

            const response = await fetch(`http://${CLIENT_IP}:${PORT}/tokens`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    password,
                }),
                // Add timeout
                timeout: 10000,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                // throw new Error(errorData.message || `Server returned ${response.status}`);
                Alert.alert(
                    'Invalid data',
                    'Username or passwords are incorrect',
                    [{ text: 'OK' }]
                  );
            }

            const tokenData = await response.json();
            
            if (!tokenData) {
                throw new Error('Invalid token received');
            }

            // Store auth data
            await AsyncStorage.setItem('userToken', tokenData);
            await AsyncStorage.setItem('username', username);
            
            // Update state
            setToken(tokenData);
            setUsername(username);
            setError(null);
            
            return true;
        } catch (error) {
            const errorMessage = error.message || 'An unexpected error occurred';
            // console.error('Login error:', errorMessage);
            setError(errorMessage);
            return false;
        }
    };

    const loginByToken = async (authToken) => {
        let isValidToken = false;
        try {
            setError(null);
            // setLoading(true); // Start loading only at the beginning
            
            // Check network connection
            await checkNetwork();
    
            // Validate server configuration
            validateServerUrl();
    
            // Validate the token with the server
            const response = await fetch(`http://${CLIENT_IP}:${PORT}/tokens/validate-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
            });
    
            if (!response.ok) {
                throw new Error('Invalid or expired token');
            }
    
            const userData = await response.json();
            if (!userData.username) {
                throw new Error('Invalid response from server');
            }
    
            // Store auth data
            await AsyncStorage.setItem('userToken', authToken);
            await AsyncStorage.setItem('username', userData.username);
    
            // Update state
            setToken(authToken);
            setUsername(userData.username);
    
            setError(null);
            isValidToken = true; // Mark token as valid
        } catch (error) {
            const errorMessage = error.message || 'An unexpected error occurred';
            console.log('Login by token error:', errorMessage);
            setError(errorMessage);
        } finally {
            // setLoading(false); // Ensure this only happens at the end of the method
        }
        return isValidToken;
    };
    

    const logout = async () => {
        try {
            // Clear stored data
            await AsyncStorage.multiRemove(['userToken', 'username']);
            
            // Clear state
            setToken(null);
            setUsername(null);
            setError(null);
        } catch (error) {
            console.error('Logout error:', error);
            setError('Failed to logout');
        }
    };

    useEffect(() => {
        const loadStoredAuth = async () => {
            try {
                const [storedToken, storedUsername] = await Promise.all([
                    AsyncStorage.getItem('userToken'),
                    AsyncStorage.getItem('username')
                ]);

                if (storedToken && storedUsername) {
                    setToken(storedToken);
                    setUsername(storedUsername);
                }
            } catch (error) {
                console.error('Error loading auth info:', error);
                setError('Failed to load authentication data');
            } finally {
                setLoading(false);
            }
        };

        loadStoredAuth();
    }, []);

    const authContext = {
        token,
        username,
        loading,
        error,
        login,
        loginByToken,
        logout,
        isAuthenticated: !!token,
        setUsername
    };

    return (
        <AuthContext.Provider value={authContext}>
            {!loading && children}
        </AuthContext.Provider>
    );
};