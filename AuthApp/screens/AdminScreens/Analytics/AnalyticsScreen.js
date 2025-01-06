import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import Header from '../../../components/Header';
import ScreenContainer from '../../../components/ScreenContainer';

const AnalyticsScreen = ({ navigation }) => {
  const date = new Date();
  const [year, setYear] = useState(date.getFullYear());
  const [month, setMonth] = useState(date.getMonth()); 

  // Month names for display
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // Handle moving to the next year
  const handleNextYear = () => setYear(year + 1);
  const handlePreviousYear = () => setYear(year - 1);

  // Handle moving to the next month
  const handleNextMonth = () => {
    if (month === 11) { 
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  // Handle moving to the previous month
  const handlePreviousMonth = () => {
    if (month === 0) { 
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  return (
    <ScreenContainer>
      {/* Header */}
      <Header
        title="Analytics and Reporting"
        onBackPress={() => navigation.goBack()}
        icon={<MaterialIcons name="bar-chart" size={24} color="black" />}
      />

      {/* Year Selector */}
      <View style={styles.yearContainer}>
        <TouchableOpacity onPress={handlePreviousYear}>
          <Ionicons name="chevron-back-outline" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.yearText}>{year}</Text>
        <TouchableOpacity onPress={handleNextYear}>
          <Ionicons name="chevron-forward-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Month Selector */}
      <View style={styles.monthContainer}>
        <TouchableOpacity onPress={handlePreviousMonth}>
          <Ionicons name="chevron-back-outline" size={16} color="black" />
        </TouchableOpacity>
        <Text style={styles.monthText}>{monthNames[month]}</Text>
        <TouchableOpacity onPress={handleNextMonth}>
          <Ionicons name="chevron-forward-outline" size={16} color="black" />
        </TouchableOpacity>
      </View>

      {/* Analytics Data */}
      <View style={styles.analyticsCard}>
        <Text>New users: 232</Text>
        <Text>New events: 76</Text>
        <Text>New clicks: 56</Text>

        {/* Placeholder for the chart */}
        <View style={styles.chartPlaceholder}>
          <Text style={styles.chartText}>Graph Placeholder</Text>
        </View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  yearContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  yearText: {
    fontSize: 36,
    fontWeight: 'bold',
    marginHorizontal: 20,
    color: 'gray',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    paddingLeft: 35,
    paddingRight: 35
  },
  monthContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  monthText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#a9a9a9', // Regular gray for the month, lighter than the year
    marginHorizontal: 20,
  },
  analyticsCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginHorizontal: 20,
    marginVertical: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 3,
  },
  chartPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginTop: 20,
  },
  chartText: {
    fontSize: 14,
    color: 'gray',
  },
});

export default AnalyticsScreen;
