import { StyleSheet, View } from 'react-native'
import React from 'react'
import Button from './Button'

const COLORS = {
    like: "#00eda6",
    nope: "#ff006f",
    star: "#07A6FF",
}

const Footer = ({handleChoice}) => {
  return (
    <View style={styles.container}>
        <Button name="times" size={24} color={COLORS.nope} onPress={() => handleChoice(-1)}/>
        <Button name="star" size={24} color={COLORS.star} style={{height: 40, width: 40}}/>
        <Button name="heart" size={24} color={COLORS.like} onPress={() => handleChoice(1)}/>
    </View>
  )
}

export default Footer;

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 50,
        width: 240,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        zIndex: 999,
    },
})