  import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AlertModal } from '@/src/Components/Modal';

interface QRCodeScannerViewProps {
  type: 'patient' | 'user';
  onScan: (data: string) => void;
  onClose: () => void;
}

const QRCodeScannerView: React.FC<QRCodeScannerViewProps> = ({ type, onScan, onClose }) => {
  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [analyzing, setAnalyzing] = useState(false);
  const [simpleAlert, setSimpleAlert] = useState<{ visible: boolean; title: string; message: string; type: 'error' | 'warning' | 'success'; }>({ visible: false, title: '', message: '', type: 'error' });
  
  // Fonction pour choisir une image depuis la galerie
  const pickImage = async () => {
    try {
      // Demander la permission d'accéder à la galerie
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        setSimpleAlert({ visible: true, title: 'Permission requise', message: 'Nous avons besoin de votre permission pour accéder à la galerie', type: 'warning' });
        return;
      }
      
      // Lancer le sélecteur d'images
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Analyser l'image pour y détecter un QR code en utilisant l'API goqr.me
        try {
          setAnalyzing(true);
          const imageUri = result.assets[0].uri;
          
          console.log('Image sélectionnée:', imageUri);
          
          // Préparer l'image pour l'envoi
          const formData = new FormData();
          
          // Extraire le nom du fichier et le type MIME
          const uriParts = imageUri.split('/');
          const fileName = uriParts[uriParts.length - 1];
          const fileType = fileName.split('.').pop() || 'jpeg';
          
          // Ajouter l'image au FormData
          formData.append('file', {
            uri: Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri,
            name: fileName,
            type: `image/${fileType}`,
          } as any);
          
          console.log('Envoi de l\'image à l\'API goqr.me...');
          
          // Envoyer l'image à l'API goqr.me
          const response = await fetch('https://api.qrserver.com/v1/read-qr-code/', {
            method: 'POST',
            body: formData,
            headers: {
              'Accept': 'application/json',
            },
          });
          
          // Analyser la réponse
          const data = await response.json();
          console.log('Réponse de l\'API:', data);
          
          setAnalyzing(false);
          
          // Vérifier si un QR code a été détecté
          if (data && data.length > 0 && data[0].symbol && data[0].symbol.length > 0 && data[0].symbol[0].data) {
            // QR code détecté avec succès
            const qrData = data[0].symbol[0].data;
            console.log('Données du QR code:', qrData);
            
            if (qrData === 'error decoding QR Code') {
              setSimpleAlert({ visible: true, title: 'Erreur de décodage', message: 'Impossible de décoder le QR code dans cette image. Veuillez essayer avec une autre image.', type: 'error' });
            } else {
              onScan(qrData);
            }
          } else {
            // Aucun QR code détecté
            setSimpleAlert({ visible: true, title: 'Aucun QR code détecté', message: "Aucun QR code n\'a été détecté dans cette image. Veuillez essayer avec une autre image.", type: 'warning' });
          }
        } catch (error) {
          console.error('Erreur lors de l\'analyse de l\'image:', error);
          setAnalyzing(false);

          setSimpleAlert({ visible: true, title: "Erreur d\'analyse", message: "Une erreur est survenue lors de l\'analyse de l\'image. Veuillez vérifier votre connexion internet et réessayer.", type: 'error' });
        }
      }
    } catch (error) {
      console.error('Erreur lors de la sélection d\'image:', error);
      setSimpleAlert({ visible: true, title: 'Erreur', message: "Une erreur est survenue lors de la sélection de l\'image.", type: 'error' });
    }
  };

  const handleBarCodeScanned = ({ data }: { type: string; data: string }) => {
    if (scanned) return;
    
    setScanned(true);
    onScan(data);
  };

  if (!permission) {
    // Les permissions de la caméra sont en cours de chargement
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Chargement des permissions de la caméra...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    // Les permissions de la caméra ne sont pas encore accordées
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Nous avons besoin de votre permission pour utiliser la caméra</Text>
        <TouchableOpacity 
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Autoriser l'accès</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={onClose}
        >
          <Text style={styles.closeButtonText}>Annuler</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      >
        <View style={styles.overlay}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.headerCloseButton}
              onPress={onClose}
            >
              <Ionicons name="close" size={28} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{type === 'patient' ? 'Scanner un QR code patient' : 'Scanner un QR code'}</Text>
          </View>
          
          <View style={styles.scanArea}>
            <View style={styles.cornerTopLeft} />
            <View style={styles.cornerTopRight} />
            <View style={styles.cornerBottomLeft} />
            <View style={styles.cornerBottomRight} />
          </View>
          
          <View style={styles.galleryButtonContainer}>
            <TouchableOpacity 
              style={styles.galleryButton}
              onPress={pickImage}
              disabled={analyzing}
            >
              {analyzing ? (
                <>
                  <ActivityIndicator size="small" color="#FFFFFF" style={{marginRight: 8}} />
                  <Text style={styles.galleryButtonText}>Analyse en cours...</Text>
                </>
              ) : (
                <>
                  <MaterialIcons name="photo-library" size={24} color="#FFFFFF" />
                  <Text style={styles.galleryButtonText}>Choisir dans la Galerie</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
          
          {scanned && (
            <TouchableOpacity 
              style={styles.scanAgainButton}
              onPress={() => setScanned(false)}
            >
              <Text style={styles.scanAgainText}>Scanner à nouveau</Text>
            </TouchableOpacity>
          )}
        </View>
      </CameraView>
      {simpleAlert.visible && (
        <AlertModal
          title={simpleAlert.title}
          type={simpleAlert.type}
          message={simpleAlert.message}
          onClose={() => setSimpleAlert({ ...simpleAlert, visible: false })}
          isVisible={simpleAlert.visible}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  permissionButton: {
    backgroundColor: '#8BC34A',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginBottom: 15,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  camera: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  headerCloseButton: {
    marginRight: 15,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 15,
  },
  galleryButtonContainer: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  galleryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  galleryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 8,
  },
  scanArea: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 250,
    height: 250,
    marginLeft: -125,
    marginTop: -125,
  },
  cornerTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 50,
    height: 50,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#8BC34A',
    borderTopLeftRadius: 10,
  },
  cornerTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 50,
    height: 50,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: '#8BC34A',
    borderTopRightRadius: 10,
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 50,
    height: 50,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#8BC34A',
    borderBottomLeftRadius: 10,
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 50,
    height: 50,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: '#8BC34A',
    borderBottomRightRadius: 10,
  },
  scanAgainButton: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    backgroundColor: '#8BC34A',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  scanAgainText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default QRCodeScannerView;
