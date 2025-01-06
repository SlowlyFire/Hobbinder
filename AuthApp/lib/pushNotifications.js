
import { useState, useEffect, useRef } from "react";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { CLIENT_IP, PORT } from '@env';

export const usePushNotifications = (username) => {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldPlaySound: false,
          shouldShowAlert: true,
          shouldSetBadge: false,
        }),
    });

    const [expoPushToken, setExpoPushToken] = useState(null);
    const [notification, setNotification] = useState(null);
    const [isRegistered, setIsRegistered] = useState(false); 

    		
    const notificationListener = useRef();
    const responseListener = useRef();

    useEffect(() => {
        let isMounted = true;

        const initializePushNotifications = async () => {
            if (!username || isRegistered) return; // Check if already registered
            try {
                const token = await registerForPushNotificationsAsync();
                if (!isMounted) return;
                if (token) {
                    setExpoPushToken(token);
                    try {
                        console.log('Attempting to save token for user:', username);
                        const response = await fetch(`http://${CLIENT_IP}:${PORT}/expo/tokens`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                username: username,
                                token: token
                            }),
                        });

                        if (response.ok) {
                            setIsRegistered(true); 
                            console.log('Successfully saved push token');
                        } else {
                            console.log('Failed to save token:', await response.text());
                        }
                    } catch (error) {
                        console.log('Error saving push token:', error);
                    }
                }
            } catch (error) {
                console.log('Error in push notification setup:', error);
            }
        };

        if (username && !isRegistered) {
            initializePushNotifications();
        }

        return () => {
            isMounted = false;
        };
    }, [username, isRegistered]);

    const registerForPushNotificationsAsync = async () => {
        try {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            
            if (finalStatus !== 'granted') {
                return null;
            }

            return await Notifications.getExpoPushTokenAsync();
        } catch (error) {
            console.log('Error getting push notification permissions:', error);
            return null;
        }
    };

    return { expoPushToken, notification };
};