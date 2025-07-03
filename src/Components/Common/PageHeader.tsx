import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Action {
    Element: React.ReactNode;
    onPress: () => void;
}

interface PageHeaderProps {
  title: string;
  onBack?: () => void;
  endActions?: Action[];
  startActions?: Action[];
  backgroundColor?: string;
}

/**
 * Composant d'en-tête de page réutilisable avec bouton retour et actions optionnelles
 */
const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  onBack,
  endActions,
  startActions,
  backgroundColor = 'red',
}) => {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View style={[styles.header, { backgroundColor }]}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={handleBack}
      >
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>
      
      <Text style={styles.headerTitle}>{title}</Text>
      
      <View style={styles.headerActions}>
        {startActions?.map((action, index) => (
          <TouchableOpacity key={index} onPress={action.onPress} style={styles.headerButton}>
            {action.Element}
          </TouchableOpacity>
        ))}
        
        {endActions?.map((action, index) => (
          <TouchableOpacity key={index} onPress={action.onPress} style={styles.headerButton}>
            {action.Element}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 5,
    marginLeft: 15,
  },
});

export default PageHeader;
