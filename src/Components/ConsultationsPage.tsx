import { FontAwesome5 } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Images } from '../Constants/Images';

interface ConsultationsPageProps {
  onOptionPress: (option: string) => void;
  onBackPress: () => void;
}

const ConsultationsPage: React.FC<ConsultationsPageProps> = ({ onOptionPress, onBackPress }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBackPress}
        >
          <FontAwesome5 name="arrow-left" size={20} color="white" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Image
            source={Images.goutteSangBlanc}
            style={styles.logo}
            contentFit="contain"
          />
        <Text style={styles.headerTitle}>Consultations</Text>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* DT1 Option */}
        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => onOptionPress('dt1')}
          activeOpacity={0.7}
        >
          <View style={styles.iconContainer}>
            <FontAwesome5 name="tachometer-alt" size={76} color="#D50000" />
          </View>
          <Text style={styles.optionText}>DT1</Text>
        </TouchableOpacity>

        {/* DT2 Option */}
        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => onOptionPress('dt2')}
          activeOpacity={0.7}
        >
          <View style={styles.iconContainer}>
            <FontAwesome5 name="syringe" size={76} color="#D50000" />
          </View>
          <Text style={styles.optionText}>DT2</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: 'red',
    color: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    color: 'white',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    width: 40,
  },
  logo: {
    width: 30,
    height: 30,
    tintColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  optionCard: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    paddingVertical: 20,
    marginBottom: 40,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 2999,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionText: {
    paddingTop: 20,
    fontSize: 32,
    fontWeight: 'bold',
    color: '#212121',
  },
});

export default ConsultationsPage;
