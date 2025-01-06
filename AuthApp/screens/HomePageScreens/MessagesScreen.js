import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ReceiverMessage from '../../components/ReceiverMessage';
import SenderMessage from '../../components/SenderMessage';
import RenderImage from '../../components/RenderImage';
import { AuthContext } from '../../context/AuthContext';
import { SocketContext } from '../../context/SocketContext';
import { CLIENT_IP, PORT } from '@env';

const MessagesScreen = ({ route, navigation }) => {
  const { chatWithUser, updatedEventIdLiked } = route.params;
  const { token, isAuthenticated, username } = useContext(AuthContext);
  const socket = useContext(SocketContext);
  const [msg, setMsg] = useState('');
  const [messageList, setMessageList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatId, setChatId] = useState(route.params.chatId);
  const [loadingNewChat, setLoadingNewChat] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [chatIsDeleted, setChatIsDeleted] = useState(false);

  const getFullChat = async () => {
    try {
      const res = await fetch(`http://${CLIENT_IP}:${PORT}/chats/${chatId}/messages`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        setMessageList(data);
      } else {
        Alert.alert('Error', 'Failed to fetch messages');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while getting the messages');
    } finally {
      setLoading(false);
    }
  };

  const addNewMessage = async () => {
    try {
      const response = await fetch(`http://${CLIENT_IP}:${PORT}/chats/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ msg }),
      });

      const data = await response.json();
      
      if (response.ok) {
        const newMsgJson = {
          id: messageList[0]?.id + 1 || 1,
          created: new Date(), 
          sender: {
            username: username
          },
          content: msg
        }
        setMessageList((prevMessages) => [newMsgJson, ...prevMessages]);
        socket.emit("sendMessage", chatWithUser.username, newMsgJson);
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (error) {
      console.error('Message error:', error);
      Alert.alert('Error', 'An error occurred while sending a message');
    }
  };

  const addNewChat = async () => {
    try {
      const response = await fetch(`http://${CLIENT_IP}:${PORT}/chats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username: chatWithUser.username, updatedEventIdLiked: updatedEventIdLiked, msg: msg }),
      });
  
      const data = await response.json();
      if (response.ok) {
        setChatId(data.id); 
        const newMsgJson = {
          id: 1,
          created: new Date(), 
          sender: {
            username: username
          },
          content: msg
        }
        setMessageList((prevMessages) => [newMsgJson, ...prevMessages]);
        socket.emit("addChat", chatWithUser.username, data);
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (error) {
      console.error('Chat error:', error);
      Alert.alert('Error', 'An error occurred while adding a new chat');
    } finally {
      setLoadingNewChat(false);
    }
  };  

  const deleteChatOrClick = async () => {
    if (chatId !== -1) {
      try {
        const response = await fetch(`http://${CLIENT_IP}:${PORT}/chats/${chatId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
    
        const data = await response.json();
        if (response.ok) {
          socket.emit("removeChat", chatWithUser.username, chatId);
          navigation.goBack();
        } else {
          Alert.alert('Error', data.message);
        }
      } catch (error) {
        console.error('Chat error:', error);
        Alert.alert('Error', 'An error occurred while deleting the chat');
      }
    } else {
      try {
        const response = await fetch(`http://${CLIENT_IP}:${PORT}/chats/unmatch/click`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ username: chatWithUser.username, updatedEventIdLiked: updatedEventIdLiked }),
        });
    
        const data = await response.json();
        if (response.ok) {
          navigation.goBack();
        } else {
          Alert.alert('Error', data.message);
        }
      } catch (error) {
        console.error('Click error:', error);
        Alert.alert('Error', 'An error occurred while unmatching the click');
      }
    }
  };

  const sendMessage = async () => {
    if (!msg.trim()) return;
    
    if (chatId === -1 && !loadingNewChat && !chatIsDeleted) {
      // Create a new chat if the chatId is invalid
      setLoadingNewChat(true);
      await addNewChat();
    }
    
    // After creating a new chat (if needed), proceed to add the message
    if (chatId !== -1 && !loadingNewChat && !chatIsDeleted) {
      await addNewMessage();
        
    }
    setMsg(''); // Reset the message input
  };

  useEffect(() => {
    if (chatId !== -1) {
      getFullChat();
    } else {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    if (socket) {
      // Listen for incoming messages
      socket.on("receiveMessage", (message) => {
        setMessageList((prevMessages) => [message, ...prevMessages]);
      });

      socket.on("deleteChat", (chatId) => {
       setChatIsDeleted(true)
       // Alert.alert('Note', 'The chat has been deleted');
      });
    }
  }, [socket, token]);

  useEffect(() => {
    if (!isAuthenticated) {
      Alert.alert(
        'Not Authenticated',
        'Please login first',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    }
  }, [isAuthenticated]);

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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('UserProfile', { username: chatWithUser.username })}>
          <RenderImage img={chatWithUser.profile_pic} imgStyle={styles.profileImage}/>
        </TouchableOpacity>
        <View style={styles.userInfo}>
          <Text style={styles.username}>{chatWithUser.username}</Text>
        </View> 
        <TouchableOpacity onPress={() => setDropdownVisible(!dropdownVisible)} style={styles.menuButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="black" />
        </TouchableOpacity>
        {dropdownVisible && (
          <View style={styles.dropdown}>
            <TouchableOpacity onPress={deleteChatOrClick} style={styles.dropdownOption}>
              {chatId !== -1 ? (
                <Text style={styles.dropdownText}>Delete Chat</Text>
              ) : (
                <Text style={styles.dropdownText}>Delete click</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

     {/* Chat Messages */}
     <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flexContainer}
        keyboardVerticalOffset={10}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <FlatList
            data={messageList}
            style={styles.messageList}
            keyExtractor={(item) => item.id}
            inverted={true}
            renderItem={({ item: message }) =>   
              message.sender.username === username ? (
                <SenderMessage message={message} />
              ) : (
                <ReceiverMessage message={message} />
              )
            }
          />
        </TouchableWithoutFeedback>

        {/* Input Field */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Send Message..."
            onChangeText={(text) => {
              setMsg(text);
              
            }}
            onSubmitEditing={sendMessage}
            value={msg}
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Text style={styles.sendButtonText}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
     
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    marginTop: 30,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userInfo: {
    marginLeft: 10,
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  status: {
    fontSize: 14,
    color: 'green',
  },
  flexContainer: {
    flex: 1,
  },
  messageList: {
    flex: 1,
    paddingHorizontal: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#eaeaea',
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    backgroundColor: '#f9f9f9',
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#000',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 18,
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
  backButton: {
    position: 'relative',
    left: 0,
    padding: 5,
  },
  menuButton: {
    marginLeft: 'auto',
    padding: 5,
  },
  dropdown: {
    position: 'absolute',
    top: 60,
    right: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    zIndex: 10,
  },
  dropdownOption: {
    padding: 10,
  },
  dropdownText: {
    fontSize: 16,
    color: 'red',
  },
});

export default MessagesScreen;
