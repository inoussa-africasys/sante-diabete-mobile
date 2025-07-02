import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

const Utilisateur = () => {
  return (
    <View style={styles.container}>
      <Text>Utilisateur</Text>
    </View>
  )
}

export default Utilisateur

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
})