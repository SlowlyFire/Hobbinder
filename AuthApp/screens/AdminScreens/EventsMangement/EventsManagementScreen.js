import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../../components/Header';
import SearchBar from '../../../components/SearchBar';
import ScreenContainer from '../../../components/ScreenContainer';
import EventsList from '../../../components/EventsList';
import FilteredChip from '../../../components/FilteredChip';
import LoadingComp from '../../../components/LoadingComp';
import { FuncNavigationContext } from '../../../context/FuncNavigationContext'; 
import { AuthContext } from '../../../context/AuthContext';
import { CLIENT_IP, PORT } from '@env';

const EventManagementScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const { filteredCategories, setFilteredCategories, filteredUser, setFilteredUser } = useContext(FuncNavigationContext);
  const { token } = useContext(AuthContext);

  const getAllEvents = async () => {
    try {
      const res = await fetch(`http://${CLIENT_IP}:${PORT}/events/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      const data = await res.json();
      if (res.ok) {
        setEvents(data);
      } else {
        Alert.alert('Error', 'Failed to fetch events');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while getting the events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllEvents();
  }, [events]);

  const filteredEvents = events.filter((event) => {
    let searchFilter = event.category.toLowerCase().includes(searchQuery.toLowerCase());
    let categoryFilter = filteredCategories.some(category => category === event.category);
    let uploaderFilter = event.uploader.username === filteredUser;
    if (filteredCategories.length === 0) {
      if (!filteredUser) {
        return searchFilter;
      } else {
        return uploaderFilter && searchFilter;
      }
    } else {
      if (!filteredUser) {
        return categoryFilter && searchFilter;
      } else {
        return categoryFilter && uploaderFilter  && searchFilter;
      }
    }  
  });

  const handleEventPress = (id) => {
    navigation.navigate('EventDetails', { 
      id: id, 
     });
  };

  const handleFilter = () => {
    setFilterModalVisible(true); 
  };
  
  const applyFilter = (filterType) => {
    setFilterModalVisible(false); 
    if (filterType === 'by category') {
      navigation.navigate('ChooseHobbies', {
        userProfile: null,
        isAdmin: true,
        isToSetFilteredCategories: true,
        filteredEvents: filteredCategories
      });
    } else if (filterType === 'by uploader') {
      navigation.navigate('UserManagement', {
        toFilter: true,
      });
    }
  };

  const clearCategoryFilter = (category) => {
    setFilteredCategories(filteredCategories.filter(hobby => hobby !== category)); 
  };

  const clearUserFilter = () => {
    setFilteredUser(null);
  };

  if (loading) {
    return (
      <LoadingComp loadingText="Loading events..."/>
    );
  }

  return (
    <ScreenContainer>
      <Header 
        title="Events Management" 
        onBackPress={() => navigation.goBack()} 
        icon={<Ionicons name="list-outline" size={24} color="black" />}
      />

      <View style={styles.searchFilterContainer}>
        <SearchBar 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          placeholder="Search" 
          hasFilter={true} 
        />
        <TouchableOpacity style={styles.filterButton} onPress={handleFilter}>
          <Ionicons name="filter" size={18} color="#333" />
          <Text style={styles.filterText}>Filter</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filteredContainer}>
        {filteredUser && (
          <View style={styles.filteredUserContainer}>
            <Text style={styles.filteredText}>Filtered by uploader:</Text>
            <FilteredChip 
              item={filteredUser} 
              onRemove={clearUserFilter} 
            />
          </View>
        )}

        {filteredCategories.length > 0 && (
          <View>
            <Text style={styles.filteredText}>Filtered Categories:</Text>
            <View style={styles.chipsContainer}>
              {filteredCategories.map((category, index) => (
                <FilteredChip 
                  key={index} 
                  item={category} 
                  onRemove={clearCategoryFilter} 
                />
              ))}
            </View>
          </View>
        )}
      </View>

      <EventsList events={filteredEvents} onEventPress={handleEventPress} />

      {/* Modal for filter options */}
      <Modal
        visible={filterModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Filter Events</Text>
            <TouchableOpacity style={styles.modalOption} onPress={() => applyFilter('by category')}>
              <Text style={styles.modalOptionText}>By Category</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalOption} onPress={() => applyFilter('by uploader')}>
              <Text style={styles.modalOptionText}>By Uploader</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCancel} onPress={() => setFilterModalVisible(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  searchFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    paddingHorizontal: 10,
    marginLeft: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#f0f0f0',
  },
  filterText: {
    marginLeft: 5,
    color: '#333',
    fontSize: 16,
  },
  filteredText: {
    fontSize: 16,
    color: '#4A90E2',
    marginBottom: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: 250,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalOption: {
    paddingVertical: 10,
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
  },
  modalCancel: {
    marginTop: 15,
  },
  modalCancelText: {
    fontSize: 16,
    color: 'red',
  },
  filteredContainer: {
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  filteredUserContainer: {
    alignItems: 'flex-start',
    marginVertical: 5,
  },
});

export default EventManagementScreen;
