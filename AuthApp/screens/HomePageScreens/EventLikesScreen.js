import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    Image,
    TouchableOpacity,
    SafeAreaView,
    Alert
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { CLIENT_IP, PORT } from '@env';
import { Ionicons } from '@expo/vector-icons';

const EventLikesScreen = ({ route, navigation }) => {
    const { token, isAuthenticated } = useContext(AuthContext);
    const [likes, setLikes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { eventId } = route.params;

    const fetchEventLikes = async () => {
        try {
            setLoading(true);
            setError(null);

            if (!isAuthenticated) {
                throw new Error('Authentication required');
            }

            console.log('Fetching likes for event:', eventId); // Debug log

            const response = await fetch(`http://${CLIENT_IP}:${PORT}/events/${eventId}/liked`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('Response status:', response.status); // Debug log

            if (!response.ok) {
                const errorData = await response.text();
                console.log('Error response:', errorData); // Debug log

                if (response.status === 401 || response.status === 403) {
                    navigation.navigate('Login');
                    throw new Error('Session expired');
                }
                throw new Error(`Failed to fetch likes: ${errorData}`);
            }

            const data = await response.json();
            console.log('Received likes data:', data); // Debug log

            // Ensure we have an array of likes
            setLikes(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Detailed error in fetchEventLikes:', error);
            setError(error.message);
            if (error.message.includes('Authentication required')) {
                navigation.navigate('Login');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (eventId) {
            fetchEventLikes();
        } else {
            console.error('No eventId provided');
            setError('Invalid event ID');
        }
    }, [eventId]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleMessagePress = (username) => {
        Alert.alert('Coming Soon', 'Messaging feature will be available soon!');
    };

    const handleProfilePress = (username) => {
        navigation.navigate('UserProfile', { username });
    };

    const renderUserCard = ({ item, index }) => (
        <View style={styles.userCard}>
            <TouchableOpacity
                style={styles.userInfo}
                onPress={() => handleProfilePress(item.username)}
            >
                <Image
                    source={{
                        uri: item.profile_pic || 'https://via.placeholder.com/50'
                    }}
                    style={styles.profilePic}
                />
                <View style={styles.userDetails}>
                    <Text style={styles.userName}>
                        {item.first_name} {item.last_name || ''}
                    </Text>
                    <Text style={styles.userTime}>
                        Liked {formatDate(item.likedAt)}
                    </Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.messageButton}
                onPress={() => handleMessagePress(item.username)}
            >
                <Ionicons name="chatbubble-outline" size={24} color="#6ED784" />
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerText}>People Who Liked</Text>
                <View style={styles.backButton} />
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#6ED784" />
                    <Text style={styles.loadingText}>Loading likes...</Text>
                </View>
            ) : error ? (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={fetchEventLikes}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : likes.length === 0 ? (
                <View style={styles.noLikesContainer}>
                    <Ionicons name="heart-outline" size={48} color="#ccc" />
                    <Text style={styles.noLikesText}>No likes yet</Text>
                    <Text style={styles.noLikesSubText}>Be patient, they'll come!</Text>
                </View>
            ) : (
                <FlatList
                    data={likes}
                    renderItem={renderUserCard}
                    keyExtractor={(item, index) => `${item.username}-${item.likedAt}-${index}`}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    refreshing={loading}
                    onRefresh={fetchEventLikes}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e1e1e1',
        backgroundColor: 'white',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    listContainer: {
        padding: 16,
    },
    userCard: {
        flexDirection: 'row',
        backgroundColor: 'white',
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    userInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    profilePic: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#f0f0f0',
    },
    userDetails: {
        marginLeft: 12,
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 2,
    },
    userTime: {
        fontSize: 12,
        color: '#666',
        marginBottom: 2,
    },
    userHobbies: {
        fontSize: 12,
        color: '#888',
    },
    messageButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#f8f8f8',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: '#FF4F6F',
        textAlign: 'center',
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: '#6ED784',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    retryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    noLikesContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    noLikesText: {
        fontSize: 18,
        color: '#666',
        marginTop: 12,
    },
    noLikesSubText: {
        fontSize: 14,
        color: '#888',
        marginTop: 8,
    },
});

export default EventLikesScreen;