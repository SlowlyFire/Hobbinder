import { View, Text, StyleSheet } from 'react-native'
import React from 'react'

const COLORS = {
    like: "#00eda6",
    nope: "#ff006f",
}

const Choice = ({type}) => {
    const color = COLORS[type]
  return (
    <View style={[styles.ofView, {borderColor: color} ]}>
      <Text style={[styles.ofText, {color:color}]}>{type}</Text>
    </View>
  )
}

const styles= StyleSheet.create({
    ofView: {
        borderWidth: 7,
        paddingHorizontal: 15,
        borderRadius: 15,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    ofText: {
        fontSize: 48,
        fontWeight: 'bold',
        textTransform: "uppercase",
        letterSpacing: 4,
    }
});

export default Choice;

