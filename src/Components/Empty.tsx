import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type EmptyProps = {
    message: string;
    icon?: React.ReactNode;
}
const Empty: React.FC<EmptyProps> = ({ message, icon }) => {
  return (
    <View style={styles.container}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text style={styles.message}>{message}</Text>
    </View>
  )
}

export default Empty

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    message: {
        textAlign: 'center',
        fontSize: 32,
        fontWeight: 'bold',
        color: '#BDBDBD',
    },
})