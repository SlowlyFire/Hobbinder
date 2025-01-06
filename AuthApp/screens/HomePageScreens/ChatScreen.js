import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  Alert,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  FlatList,
  ScrollView
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import BottomNavigation from '../../components/BottomNavigation';
import SearchBar from '../../components/SearchBar';
import ChatList from '../../components/ChatList';
import ClickCard from '../../components/ClickCard';
import { AuthContext } from '../../context/AuthContext';
import { SocketContext } from '../../context/SocketContext';
import { CLIENT_IP, PORT } from '@env';

const ChatScreen = ({ navigation }) => {
  const { token, isAuthenticated } = useContext(AuthContext);
  const socket = useContext(SocketContext);

  const [searchQuery, setSearchQuery] = useState('');
  const [chatList, setChatList] = useState([]);
  const [clickList, setClickList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch chats from the server
  const getUserChatList = async () => {
    try {
      const res = await fetch(`http://${CLIENT_IP}:${PORT}/chats/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      const data = await res.json();
      if (res.ok) {
        const sortedChats = data.sort((a, b) =>
          new Date(b.lastMessage.created) - new Date(a.lastMessage.created)
        );
        setChatList(sortedChats);
      } else {
        Alert.alert('Error', 'Failed to fetch chat list');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while getting the chat list');
    }
  }

  // Fetch clicks from the server
  const getUserClicks = async () => {
    try {
      const res = await fetch(`http://${CLIENT_IP}:${PORT}/events/user/clicks`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (res.ok) {
        const data = await res.json();
        setClickList(data);
      } else {
        Alert.alert('Error', 'Failed to fetch click list');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while getting the click list');
    } finally {
      setLoading(false);
    }
  }

  //  // Fetch chat if already exists
  //  const fetchChat = async (otherUsername) => {
  //   try {
  //     const res = await fetch(`http://${CLIENT_IP}:${PORT}/chats/specific/${otherUsername}`, {
  //       method: 'GET',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': `Bearer ${token}`
  //       },
  //     });

  //     if (res.ok) {
  //       const data = await res.json();
  //       console.log('------------------------------')
  //       console.log(data)
  //     } else {
  //       Alert.alert('Error', 'Failed to fetch click list');
  //     }
  //   } catch (error) {
  //     Alert.alert('Error', 'An error occurred while getting the click list');
  //   } finally {
  //     setLoading(false);
  //   }
  // }

  useEffect(() => {
    getUserChatList();
    getUserClicks();
  }, []);

  useEffect(() => {
    if (socket) {
      // Listen for incoming messages
      socket.on("receiveMessage", (message) => {
        setChatList((prevChatList) => {
          // Find the chat that matches the sender of the incoming message
          const chatIndex = prevChatList.findIndex(
            (chat) => chat.user.username === message.sender.username
          );
          if (chatIndex !== -1) {
            // Update the latest message and timestamp for the matching chat
            const updatedChatItem = {
              id: prevChatList[chatIndex].id,
              lastMessage: {
                content: message.content,
                created: message.created,
                id: prevChatList[chatIndex].lastMessage.id + 1
              },
              user: prevChatList[chatIndex].user,
            };
    
            // Place the updated chat at the top of the chat list
            const newChatList = [...prevChatList];
            newChatList.splice(chatIndex, 1); // Remove the old chat entry
            return [updatedChatItem, ...newChatList]; // Add the updated chat to the top
          } else {
            // If chat doesn't exist, create a new one dynamically
            const newChat = {
              id: `new-${Date.now()}`, // Temporary unique ID
              lastMessage: {
                content: message.content,
                created: message.created,
                id: 1, // Default ID for the first message
              },
              user: {
                username: message.sender.username,
                profile_pic: "default-profile-pic.jpg", // Placeholder or fetch this dynamically
              },
            };
            return [newChat, ...prevChatList];
          }
        });
      });

      socket.on("newChat", (chat) => {
        setChatList((prevChatList) => {
          // Update the latest message and timestamp for the matching chat
            const updatedChatItem = {
              id: chat.id,
              lastMessage: {
                content: chat.messages[0].content,
                created: chat.messages[0].created,
                id: 1
              },
              user: {
                username: chat.users[0].username,
                profile_pic: chat.users[0].profile_pic
              }
            };
            
            return [updatedChatItem, ...prevChatList]; // Add the updated chat to the topZ  
        });
      });

      socket.on("deleteChat", (chatId) => {
        setChatList((prevChatList) => {
          // Remove the chat with the given chatId
          const filteredChatList = prevChatList.filter((chat) => chat.id !== chatId);
          return filteredChatList;
        });
      });
    }
  }, [socket]);

  useFocusEffect(
    React.useCallback(() => {
      getUserChatList(); 
      getUserClicks();
    }, [])
  );

  // useEffect(() => {
  //   if (!isAuthenticated) {
  //     Alert.alert(
  //       'Not Authenticated',
  //       'Please login first',
  //       [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
  //     );
  //   }
  // }, [isAuthenticated]);

  const filteredChats = chatList.filter((chat) =>  {
    console.log(chat)
    return chat.user.username.toLowerCase().includes(searchQuery.toLowerCase())}
  );

  const handleChatPress = (chatId, chatWithUser) => {
    navigation.navigate('Messages', { chatId: chatId, chatWithUser });
  };

  const handleClickPress = async (event) => {
    navigation.navigate('Messages', { chatId: -1, chatWithUser: event.liked.user, updatedEventIdLiked: event.id });
  }

  const renderEventCard = ({ item }) => ( 
    <ClickCard
      event={item}
      onCardPress={(event) => handleClickPress(event)} 
    />
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6ED784" />
          <Text style={styles.loadingText}>Loading chat...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.headerText}>Chats</Text>
          </View>

          {/* Search Bar */}
          <View style={styles.searchBar}>
            <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} placeholder="Search messages" isRegular={true}/>
          </View>

        
       {/* Clicks Cards */}

      { clickList.every(event =>
          event.liked.every(like => like.checked)
        ) ? (
          <View>
             <Text style={styles.subText}>My clicks</Text>
             <Text style={styles.noClickText}>No clicks yet</Text>
          </View> 
        ) : (
          <View style={styles.eventListContainer}>
            <Text style={styles.subText}>My clicks</Text>
            <FlatList
              data={clickList.flatMap((event, eventIndex) =>
                event.liked
                  .filter(like => !like.checked) // Filter out likes where checked is true
                  .map((like, likeIndex) => ({
                    ...event,
                    liked: like,
                    eventIndex,
                    likeIndex
                  }))
              )}
              renderItem={({ item }) =>
                renderEventCard({
                  item: { ...item, liked: item.liked },
                  index: `${item.eventIndex}-${item.likeIndex}`
                })
              }
              keyExtractor={(item, index) => `${item.eventIndex}-${item.likeIndex}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.eventsList} // Optional: additional styling for the list container
            />
          </View>
        )
      }


        {/* Chat List */}
        <Text style={styles.subText}>Messages</Text>
        <ChatList 
          chatList={filteredChats} 
          onChatPress={handleChatPress} 
        />
                
      </ScrollView>

      <View style={styles.bottomNavContainer}>
        <BottomNavigation navigation={navigation} currentScreen="Chat" />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  messagePreview: {
    fontSize: 14,
    color: '#666',
    marginTop: 3,
  },
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    elevation: 8, // for Android shadow
    shadowColor: '#000', // for iOS shadow
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    marginTop: 30,
    paddingTop: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  searchBar: {
    marginTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  eventListContainer: {
    height: 260,  
  },
  subText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    paddingLeft: 10 
  },
  chatListContainer: {
    paddingVertical: 10,
    padding: 20,
  },
  noClickText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
});

export default ChatScreen;
