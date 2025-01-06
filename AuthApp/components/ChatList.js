import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import ChatRow from './ChatRow';
import dateParser from '../lib/dateParser';

const ChatList = ({ chatList, onChatPress }) => {
  return (
    <View style={styles.chatListContainer}>
        {chatList.length > 0 ? (
        chatList.map((chat, index) => (
          <TouchableOpacity 
            key={index} 
            onPress={() => onChatPress(chat.id, chat.user)}
          >
            <ChatRow 
              username={chat.user.username} 
              imageUri={chat.user.profile_pic} 
              messagePreview={chat.lastMessage.content}
              timestamp={dateParser.formatChatTimestamp(chat.lastMessage.created)}
            />
          </TouchableOpacity>
        ))
      ) : (
        <Text style={styles.noResults}>No chats found</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  chatListContainer: {
    marginBottom: 80
  },
  noResults: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
    marginTop: 20,
  },
});

export default ChatList;
