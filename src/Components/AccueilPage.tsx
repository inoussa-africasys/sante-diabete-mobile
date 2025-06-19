import { Entypo, Feather, FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Animated, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useDiabetes } from '../context/DiabetesContext';
import { QRCodeRepository } from '../Repositories/QRCodeRepository';
import { DiabeteType } from '../types/enums';
import { ConfirmModal } from './Modal';
import { useToast } from './Toast/ToastProvider';

interface AccueilPageProps {
  onBackPress?: () => void;
}


const AccueilPage: React.FC<AccueilPageProps> = ({ onBackPress }) => {
  const router = useRouter();
  const { diabetesType } = useDiabetes();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const slideAnim = React.useRef(new Animated.Value(-300)).current;
  const { logout } = useAuth();
  const [logoutModalVisible, setLogoutModalVisible] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const { showToast } = useToast();

  const toggleMenu = () => {
    const toValue = menuOpen ? -300 : 0;
    Animated.timing(slideAnim, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setMenuOpen(!menuOpen);
  };

  const handlePatientPress = () => {
    router.push(`/liste-patient?dt=${diabetesType}`);
  };

  const handleScannerPress = () => {
    router.push('/scanner');
  };


  useEffect(() => {
    const repo = new QRCodeRepository();
    const qrCode = repo.findAll();
    console.log('QR Code:', qrCode);
  }, []);

  const handleLogout = () => {
    setIsLoading(true);
    logout({ diabetesType: diabetesType as DiabeteType });
    setIsLoading(false);
    router.replace('/'+diabetesType.toLowerCase());
    showToast('Deconnexion reussie', 'success', 3000);
  };


  const handleCloseLogoutModal = () => {
    setLogoutModalVisible(false);
  };

  return (
    <>
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="red" />
      
      {/* Slide-out Menu */}
      <Animated.View style={[styles.menu, { transform: [{ translateX: slideAnim }] }]}>
        <View style={styles.menuHeader}>
          <Text style={styles.menuTitle}>Menu</Text>
          <TouchableOpacity onPress={toggleMenu} style={styles.closeButton}>
            <Entypo name="cross" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={{
          width: '100%',
          height: '15%',
            backgroundColor: 'red',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Image
              source={require('../../assets/images/splash-icon-v2.png')}
              style={{
                width: 150,
                height: 150,
              }}
              contentFit="contain"
            />

        </View>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>CONFIG QR CODE</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>UTILISATEUR</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>CHANGER DE PROFIL</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>TRAFIC ASSISTANT</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>ADMINISTRATION</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => setLogoutModalVisible(true)}>
          <Text style={styles.menuItemText} >DECONNEXION</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Header avec dégradé */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={toggleMenu}>
          <Entypo name="menu" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Accueil</Text>
        <TouchableOpacity style={styles.headerButton} onPress={handleScannerPress}>
          <FontAwesome5 name="qrcode" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
      <View style={styles.allContent}>

      <View style={styles.gridContainer}>

      <TouchableOpacity 
            style={[styles.mediumButton]}
            onPress={() => router.push(`/liste-fiches?dt=${diabetesType}&mode=remplir`)}
          >
           <Feather 
              name="edit" 
              size={32} 
              color="#2196F3" 
            />
            <Text style={styles.buttonText}>Remplir{"\n"}une fiche</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.mediumButton}
            onPress={() => router.push(`/liste-fiches?dt=${diabetesType}&mode=editer`)}
          >
            <MaterialIcons 
              name="edit" 
              size={32} 
              color="#FFA000" 
            />
            <Text style={[styles.buttonText, styles.amberText]}>Editer{"\n"}une fiche</Text>
          </TouchableOpacity>
      </View>

        
        {/* Gros boutons */}
        <View style={styles.bigButtonsContainer}>
          <TouchableOpacity 
            style={styles.bigButton}
            onPress={handlePatientPress}
          >
            <View style={styles.buttonContent}>
              <FontAwesome5 name="user-injured" size={40} color="#2196F3" />
              <Text style={styles.bigButtonText}>Patients</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.bigButton}
            onPress={() => router.push('/sync')}
          >
            <View style={styles.buttonContent}>
              <Ionicons 
                name="sync" 
                size={40} 
                color="#2196F3" 
              />
              <Text style={styles.bigButtonText}>Synchroniser</Text>
            </View>
          </TouchableOpacity>
          
        </View>
        {/* Grille de petits boutons */}
        <View style={styles.gridContainer}>
          <TouchableOpacity 
            style={styles.mediumButton}
            onPress={() => {
              return router.push(`/download-fiche`)
              /* return router.push(`/liste-fiches?dt=${diabetesType}&mode=vierge`) */
            }}
          >
            <Entypo 
              name="download" 
              size={32} 
              color="#2196F3" 
            />
            <Text style={styles.buttonText}>Fiche vierge</Text>
          </TouchableOpacity>


          <TouchableOpacity 
            style={[styles.mediumButton, styles.deleteButton]}
            onPress={() => console.log('Stock consommables - à implémenter')}
          >
            <MaterialIcons 
              name="delete" 
              size={32} 
              color="#D32F2F" 
            />
            <Text style={[styles.buttonText, styles.redText]}>Supprimer{"\n"}une fiche</Text>
          </TouchableOpacity>
          
        </View>
      </View>
    </View>

    <ConfirmModal 
      type="danger"
      onConfirm={handleLogout}
      isVisible={logoutModalVisible} 
      onClose={handleCloseLogoutModal}
      title="Deconnexion reussie" 
      message="Vous avez ete deconnecte" 
      confirmText="OK"
    />
    </>
  );
};

const styles = StyleSheet.create({
  menu: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 300,
    backgroundColor: '#fff',
    zIndex: 999,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  menuHeader: {
    backgroundColor: 'red',
    paddingVertical: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  menuItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
  },
  container: {
    flex: 1,
    backgroundColor: '#f9fafb'
  },
  header: {
    backgroundColor: 'red',
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  headerButton: {
    padding: 8
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center'
  },
  allContent: {
    flex: 1,
    justifyContent: 'center',
    marginTop: 32,
    padding: 16
  },
  bigButtonsContainer: {
    marginBottom: 24,
    gap: 16
  },
  bigButton: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#2196F3',
    marginHorizontal: 8
  },
  buttonContent: {
    alignItems: 'center'
  },
  bigButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 12,
    color: '#1f2937'
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  mediumButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    alignItems: 'center',
    marginBottom: 16,
    width: '48%'
  },
  smallButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    alignItems: 'center',
    marginBottom: 16,
    width: '31%'
  },
  deleteButton: {
    borderWidth: 1,
    borderColor: '#DC2626'
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    color: '#1f2937',
    textAlign: 'center'
  },
  amberText: {
    color: '#FB923C'
  },
  redText: {
    color: '#DC2626'
  }
});

export default AccueilPage;
