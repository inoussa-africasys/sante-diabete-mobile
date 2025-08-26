import { useDiabetes } from '@/src/context/DiabetesContext';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { APP_GREEN } from '../Constants/Colors';

const DiabetesTypeBadge: React.FC = () => {
  const { diabetesType } = useDiabetes();

  if (!diabetesType) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Type:</Text>
      <Text style={styles.value}>{diabetesType}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: APP_GREEN,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: APP_GREEN,
    flexDirection: 'row',
    
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginHorizontal: 5,
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginHorizontal: 5,
  },
});

export default DiabetesTypeBadge;
