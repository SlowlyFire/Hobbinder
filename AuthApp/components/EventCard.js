// import React, { useState } from 'react';
// import { View, Text, Image, StyleSheet, Animated, Dimensions, TouchableOpacity } from 'react-native';
// import FormattedDate from './FormattedDate';

// const SCREEN_WIDTH = Dimensions.get('window').width;

// const EventCard = ({
//     event,
//     position,
//     isFirst,
//     isSecond,
//     panHandlers,
//     navigation,
//     onCardPress,
//     SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25
// }) => {
//     const [isSwiping, setIsSwiping] = useState(false);

//     if (!event) return null;

//     const renderLabels = () => {
//         if (!isFirst) return null;

//         return (
//             <>
//                 <Animated.View
//                     style={[
//                         styles.labelContainer,
//                         styles.likeLabel,
//                         {
//                             opacity: position.x.interpolate({
//                                 inputRange: [0, SWIPE_THRESHOLD],
//                                 outputRange: [0, 1],
//                                 extrapolate: 'clamp'
//                             })
//                         }
//                     ]}
//                 >
//                     <Text style={[styles.labelText, styles.likeText]}>LIKE</Text>
//                 </Animated.View>

//                 <Animated.View
//                     style={[
//                         styles.labelContainer,
//                         styles.nopeLabel,
//                         {
//                             opacity: position.x.interpolate({
//                                 inputRange: [-SWIPE_THRESHOLD, 0],
//                                 outputRange: [1, 0],
//                                 extrapolate: 'clamp'
//                             })
//                         }
//                     ]}
//                 >
//                     <Text style={[styles.labelText, styles.nopeText]}>NOPE</Text>
//                 </Animated.View>
//             </>
//         );
//     };

//     const cardStyle = isFirst ? {
//         transform: [
//             {
//                 rotate: position.x.interpolate({
//                     inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
//                     outputRange: ['-30deg', '0deg', '30deg'],
//                     extrapolate: 'clamp'
//                 })
//             },
//             ...position.getTranslateTransform()
//         ]
//     } : isSecond ? {
//         transform: [{
//             scale: position.x.interpolate({
//                 inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
//                 outputRange: [1, 0.95, 1],
//                 extrapolate: 'clamp'
//             })
//         }]
//     } : {};

//     const handlePress = () => {
//         if (isFirst && onCardPress && !isSwiping) {
//             onCardPress();
//         }
//     };

//         // Modify the pan handlers to track swiping state
//         const modifiedPanHandlers = isFirst ? {
//             ...panHandlers,
//             onPanResponderGrant: (...args) => {
//                 setIsSwiping(true);
//                 panHandlers.onPanResponderGrant?.(...args);
//             },
//             onPanResponderRelease: (...args) => {
//                 setTimeout(() => setIsSwiping(false), 100);
//                 panHandlers.onPanResponderRelease?.(...args);
//             },
//             onPanResponderTerminate: (...args) => {
//                 setTimeout(() => setIsSwiping(false), 100);
//                 panHandlers.onPanResponderTerminate?.(...args);
//             },
//         } : {};

//    return (
//         <Animated.View
//             style={[styles.card, cardStyle]}
//             {...modifiedPanHandlers}
//         >
//             <View style={styles.mainContainer}>
//                 <Image source={{ uri: event.img }} style={styles.cardImage} />
//                 {renderLabels()}
                
//                 <TouchableOpacity 
//                     activeOpacity={0.9}
//                     onPress={handlePress}
//                     disabled={!isFirst}
//                     style={styles.cardInfoTouchable}
//                 >
//                     <View style={styles.cardInfo}>
//                         <View style={styles.userInfo}>
//                             <Text style={styles.userName}>
//                                 <Text style={styles.nameText}>{`${event.uploader.first_name} ${event.uploader.last_name}, ${event.uploader.age}`}</Text>
//                             </Text>
//                             <Text style={styles.eventCategory}>{`${event.category}, ${event.location}`}</Text>
//                             <FormattedDate
//                                 dateString={event.when_date}
//                                 style={styles.eventDescription}
//                                 numberOfLines={2}
//                             />
//                             {isFirst && (
//                                 <TouchableOpacity
//                                     style={styles.likesButton}
//                                     onPress={() => navigation.navigate('EventLikes', { eventId: event.id })}
//                                 >
//                                 </TouchableOpacity>
//                             )}
//                         </View>
//                         <Image source={{ uri: event.uploader.profile_pic }} style={styles.userImage} />
//                     </View>
//                 </TouchableOpacity>
//             </View>
//         </Animated.View>
//     );
// };


// const styles = StyleSheet.create({
//     card: {
//         position: 'absolute',
//         width: SCREEN_WIDTH - 40,
//         height: SCREEN_WIDTH * 1.4,
//         borderRadius: 20,
//         backgroundColor: 'white',
//         shadowColor: '#000',
//         shadowOpacity: 0.2,
//         shadowRadius: 10,
//         shadowOffset: { width: 0, height: 5 },
//         elevation: 5,
//         left: 20
//     },
//     cardImage: {
//         width: '100%',
//         height: '100%',
//         borderRadius: 20,
//     },
//     labelContainer: {
//         position: 'absolute',
//         top: 50,
//         padding: 10,
//         borderWidth: 4,
//         borderRadius: 10,
//         backgroundColor: 'rgba(255,255,255,0.9)',
//     },
//     likeLabel: {
//         right: 40,
//         transform: [{ rotate: '30deg' }],
//         borderColor: '#6ED784',
//     },
//     nopeLabel: {
//         left: 40,
//         transform: [{ rotate: '-30deg' }],
//         borderColor: '#FF4F6F',
//     },
//     labelText: {
//         fontSize: 32,
//         fontWeight: 'bold',
//     },
//     likeText: {
//         color: '#6ED784',
//     },
//     nopeText: {
//         color: '#FF4F6F',
//     },
//     cardInfoTouchable: {
//         position: 'absolute',
//         bottom: 0,
//         left: 0,
//         right: 0,
//     },
//     cardInfo: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         padding: 20,
//         backgroundColor: 'rgba(0,0,0,0.5)',
//         borderBottomLeftRadius: 20,
//         borderBottomRightRadius: 20,
//     },
//     imageContainer: {
//         width: '100%',
//         height: '100%',
//         borderRadius: 20,
//     },
//     userInfo: {
//         flex: 1,
//         marginRight: 10,
//     },
//     userName: {
//         marginBottom: 5,
//     },
//     nameText: {
//         color: 'white',
//         fontSize: 24,
//         fontWeight: 'bold',
//     },
//     eventCategory: {
//         color: 'white',
//         fontSize: 16,
//         opacity: 0.8,
//         marginBottom: 5,
//     },
//     eventDescription: {
//         color: 'white',
//         fontSize: 14,
//         opacity: 0.8,
//     },
//     userImage: {
//         width: 50,
//         height: 50,
//         borderRadius: 25,
//         borderWidth: 2,
//         borderColor: 'white',
//     },
//     likesButton: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         marginTop: 5,
//     },
//     likesCount: {
//         color: 'white',
//         marginLeft: 5,
//         fontSize: 14,
//     },
//     mainContainer: {
//         flex: 1,
//         width: '100%',
//         height: '100%',
//         borderRadius: 20,
//         overflow: 'hidden',
//     },
// });

// export default EventCard;

import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Animated, Dimensions, TouchableOpacity } from 'react-native';
import FormattedDate from './FormattedDate';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

const EventCard = ({ event, position, isFirst, isSecond, panHandlers, onCardPress }) => {
    const [isSwiping, setIsSwiping] = useState(false);
    if (!event) return null;

    const cardStyle = isFirst ? {
        transform: [
            { rotate: position.x.interpolate({
                inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
                outputRange: ['-30deg', '0deg', '30deg'],
                extrapolate: 'clamp'
            })},
            ...position.getTranslateTransform()
        ]
    } : isSecond ? {
        transform: [{
            scale: position.x.interpolate({
                inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
                outputRange: [1, 0.95, 1],
                extrapolate: 'clamp'
            })
        }]
    } : {};

    const modifiedPanHandlers = isFirst ? {
        ...panHandlers,
        onPanResponderGrant: (...args) => {
            setIsSwiping(true);
            panHandlers.onPanResponderGrant?.(...args);
        },
        onPanResponderRelease: (...args) => {
            setTimeout(() => setIsSwiping(false), 100);
            panHandlers.onPanResponderRelease?.(...args);
        }
    } : {};

    return (
        <Animated.View style={[styles.card, cardStyle]} {...modifiedPanHandlers}>
            <View style={styles.container}>
                <Image source={{ uri: event.img }} style={styles.cardImage} />
                {isFirst && (
                    <>
                        <Animated.View style={[styles.label, styles.likeLabel, {
                            opacity: position.x.interpolate({
                                inputRange: [0, SWIPE_THRESHOLD],
                                outputRange: [0, 1],
                                extrapolate: 'clamp'
                            })
                        }]}>
                            <Text style={[styles.labelText, { color: '#6ED784' }]}>LIKE</Text>
                        </Animated.View>
                        <Animated.View style={[styles.label, styles.nopeLabel, {
                            opacity: position.x.interpolate({
                                inputRange: [-SWIPE_THRESHOLD, 0],
                                outputRange: [1, 0],
                                extrapolate: 'clamp'
                            })
                        }]}>
                            <Text style={[styles.labelText, { color: '#FF4F6F' }]}>NOPE</Text>
                        </Animated.View>
                    </>
                )}
                
                <TouchableOpacity 
                    activeOpacity={0.9}
                    onPress={() => isFirst && !isSwiping && onCardPress()}
                    disabled={!isFirst}
                    style={styles.infoContainer}
                >
                    <View style={styles.userInfo}>
                        <Text style={styles.name}>{`${event.uploader.first_name} ${event.uploader.last_name}, ${event.uploader.age}`}</Text>
                        <Text style={styles.details}>{`${event.category}, ${event.location.name}`}</Text>
                        <FormattedDate dateString={event.when_date} style={styles.details} numberOfLines={2} />
                    </View>
                    <Image source={{ uri: event.uploader.profile_pic }} style={styles.avatar} />
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    card: {
        position: 'absolute',
        width: SCREEN_WIDTH - 40,
        height: SCREEN_WIDTH * 1.4,
        borderRadius: 20,
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
        elevation: 5,
        left: 20
    },
    container: { flex: 1, borderRadius: 20, overflow: 'hidden' },
    cardImage: { width: '100%', height: '100%', borderRadius: 20 },
    label: {
        position: 'absolute',
        top: 50,
        padding: 10,
        borderWidth: 4,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.9)'
    },
    likeLabel: { right: 40, transform: [{ rotate: '30deg' }], borderColor: '#6ED784' },
    nopeLabel: { left: 40, transform: [{ rotate: '-30deg' }], borderColor: '#FF4F6F' },
    labelText: { fontSize: 32, fontWeight: 'bold' },
    infoContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        padding: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20
    },
    userInfo: { flex: 1, marginRight: 10 },
    name: { color: 'white', fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
    details: { color: 'white', fontSize: 14, opacity: 0.8, marginBottom: 5 },
    avatar: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: 'white' }
});

export default EventCard;