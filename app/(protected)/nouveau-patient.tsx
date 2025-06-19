import { Images } from '@/src/Constants/Images';
import { usePatient } from '@/src/Hooks/usePatient';
import { PatientFormData } from '@/src/types';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { format } from 'date-fns';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface FormErrors {
  nom?: string;
  prenom?: string;
  dateNaissance?: string;
  email?: string;
  telephone?: string;
}

export default function NouveauPatientScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState<PatientFormData>({
    nom: '',
    prenom: '',
    dateNaissance: null,
    genre: '',
    profession: '',
    telephone: '',
    email: '',
    commentaire: '',
    photo: null
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const {insertPatientOnTheLocalDb, isLoading : isLoadingPatient, error : errorPatient} = usePatient();

  useEffect(() => {
    (async () => {
      const galleryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (galleryStatus.status !== 'granted') {
        Alert.alert('Permission requise', 'Nous avons besoin de votre permission pour accéder à la galerie d\'images');
      }
    })();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // Validation du nom
    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est obligatoire';
      isValid = false;
    }

    // Validation du prénom
    if (!formData.prenom.trim()) {
      newErrors.prenom = 'Le prénom est obligatoire';
      isValid = false;
    }

    // Validation de l'email (si fourni)
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
      isValid = false;
    }

    // Validation du téléphone (si fourni)
    if (formData.telephone && !/^[0-9+\s-]{8,15}$/.test(formData.telephone)) {
      newErrors.telephone = 'Format de téléphone invalide';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = async () => {
    if (validateForm()) {
      console.log('Enregistrer patient:', formData);
      const result = await insertPatientOnTheLocalDb(formData);
      if (result && !isLoadingPatient && !errorPatient) {
        Alert.alert('Succès', 'Patient enregistré avec succès');
        router.push('/liste-patient');
      } else {
        Alert.alert('Message Erreur', 'Veuillez remplir correctement les champs !');
      }
    } else {
      Alert.alert('Message Erreur', 'Veuillez remplir correctement les champs !');
    }
  };

  if (errorPatient) {
    console.error('Message Erreur', errorPatient);
    Alert.alert('Message Erreur', errorPatient);
  }

  const handlePhotoPress = () => {
    setShowImageOptions(true);
  };

  const handlePickImage = async () => {
    setShowImageOptions(false);
    try {
      setIsLoading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setFormData({ ...formData, photo: result.assets[0].uri });
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Erreur lors de la sélection d\'image:', error);
      setIsLoading(false);
      Alert.alert('Message Erreur', 'Impossible de sélectionner une image. Veuillez réessayer.');
    }
  };
  
  const handleTakePhoto = async () => {
    setShowImageOptions(false);
    try {
      setIsLoading(true);
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setFormData({ ...formData, photo: result.assets[0].uri });
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Erreur lors de la prise de photo:', error);
      setIsLoading(false);
      Alert.alert('Message Erreur', 'Impossible de prendre une photo. Veuillez réessayer.');
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setFormData({...formData, dateNaissance: selectedDate});
      setErrors({...errors, dateNaissance: undefined});
    }
  };

  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };

  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nouveau Patient</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content}>
        {/* Photo */}
        <View style={styles.photoContainer}>
          <TouchableOpacity style={styles.photoButton} onPress={handlePhotoPress}>
            {formData.photo ? (
              <Image 
                source={{ uri: formData.photo }} 
                style={styles.photoImage}
              />
            ) : (
              <Image 
                source={Images.userIcon} 
                style={styles.photoImage}
              />
            )}
            <View style={styles.cameraIconContainer}>
              <FontAwesome5 name="camera" size={20} color="#666" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <FontAwesome5 name="user" size={20} color="#666" />
            <TextInput
              style={[styles.input, errors.nom ? styles.inputError : null]}
              placeholder="Nom*"
              value={formData.nom}
              onChangeText={(text) => {
                setFormData({...formData, nom: text});
                if (text.trim()) setErrors({...errors, nom: undefined});
              }}
            />
          </View>
          {errors.nom && <Text style={styles.errorText}>{errors.nom}</Text>}

          <View style={styles.inputContainer}>
            <FontAwesome5 name="user" size={20} color="#666" />
            <TextInput
              style={[styles.input, errors.prenom ? styles.inputError : null]}
              placeholder="Prénom*"
              value={formData.prenom}
              onChangeText={(text) => {
                setFormData({...formData, prenom: text});
                if (text.trim()) setErrors({...errors, prenom: undefined});
              }}
            />
          </View>
          {errors.prenom && <Text style={styles.errorText}>{errors.prenom}</Text>}

          <TouchableOpacity style={styles.inputContainer} onPress={showDatePickerModal}>
            <FontAwesome5 name="calendar" size={20} color="#666" />
            <Text style={[styles.input, errors.dateNaissance ? styles.inputError : null]}>
              {formData.dateNaissance ? format(formData.dateNaissance, 'dd/MM/yyyy') : 'Date de naissance'}
            </Text>
          </TouchableOpacity>
          {errors.dateNaissance && <Text style={styles.errorText}>{errors.dateNaissance}</Text>}
          
          {showDatePicker && (
            Platform.OS === 'ios' ? (
              <Modal
                transparent={true}
                animationType="slide"
                visible={showDatePicker}
              >
                <View style={styles.centeredView}>
                  <View style={styles.modalView}>
                    <DateTimePicker
                      value={formData.dateNaissance || new Date()}
                      mode="date"
                      display="spinner"
                      onChange={handleDateChange}
                    />
                    <TouchableOpacity
                      style={styles.modalButton}
                      onPress={() => setShowDatePicker(false)}
                    >
                      <Text style={styles.modalButtonText}>Confirmer</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            ) : (
              <DateTimePicker
                value={formData.dateNaissance || new Date()}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )
          )}

          <View style={styles.genreContainer}>
            <Text style={styles.genreLabel}>Genre</Text>
            <View style={styles.genreSelector}>

              <Picker
                selectedValue={formData.genre}
                onValueChange={(itemValue, itemIndex) => setFormData({...formData, genre: itemValue})}
                style={{ height: 50, width: "100%" }}
              >
                <Picker.Item label="Sélectionner le genre" />
                <Picker.Item label="Homme" value="H" />
                <Picker.Item label="Femme" value="F" />
              </Picker>

            </View>
          </View>

          <View style={styles.inputContainer}>
            <FontAwesome5 name="briefcase" size={20} color="#666" />
            <TextInput
              style={styles.input}
              placeholder="Profession"
              value={formData.profession}
              onChangeText={(text) => setFormData({...formData, profession: text})}
            />
          </View>

          <View style={styles.inputContainer}>
            <FontAwesome5 name="phone" size={20} color="#666" />
            <TextInput
              style={[styles.input, errors.telephone ? styles.inputError : null]}
              placeholder="Numéro de Téléphone"
              value={formData.telephone}
              onChangeText={(text) => {
                setFormData({...formData, telephone: text});
                if (errors.telephone) setErrors({...errors, telephone: undefined});
              }}
              keyboardType="phone-pad"
            />
          </View>
          {errors.telephone && <Text style={styles.errorText}>{errors.telephone}</Text>}

          <View style={styles.inputContainer}>
            <FontAwesome5 name="envelope" size={20} color="#666" />
            <TextInput
              style={[styles.input, errors.email ? styles.inputError : null]}
              placeholder="Adresse email"
              value={formData.email}
              onChangeText={(text) => {
                setFormData({...formData, email: text});
                if (errors.email) setErrors({...errors, email: undefined});
              }}
              keyboardType="email-address"
            />
          </View>
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          <View style={styles.commentContainer}>
            <Text style={styles.commentLabel}>Commentaire</Text>
            <TextInput
              style={styles.commentInput}
              placeholder="Un petit commentaire sur le patient"
              value={formData.commentaire}
              onChangeText={(text) => setFormData({...formData, commentaire: text})}
              multiline
              numberOfLines={4}
            />
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>{isLoading ? <ActivityIndicator size="small" color="white" /> : ''} ENREGISTRER</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal pour les options de photo */}
      <Modal
        visible={showImageOptions}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowImageOptions(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.optionsContainer}>
            <Text style={styles.optionsTitle}>Choisir une photo</Text>
            
            <TouchableOpacity style={styles.optionButton} onPress={handleTakePhoto}>
              <FontAwesome5 name="camera" size={24} color="#666" />
              <Text style={styles.optionText}>Prendre une photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.optionButton} onPress={handlePickImage}>
              <FontAwesome5 name="image" size={24} color="#666" />
              <Text style={styles.optionText}>Choisir depuis la galerie</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.optionButton, styles.cancelButton]} 
              onPress={() => setShowImageOptions(false)}
            >
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>



      {/* Indicateur de chargement global */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="red" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    paddingBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: 'red',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    padding: 5,
    color: 'white',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  headerRight: {
    width: 34, // Pour équilibrer avec le bouton retour
  },
  content: {
    flex: 1,
  },
  photoContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  photoButton: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  photoImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  cameraIconContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  form: {
    padding: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingVertical: 10,
    marginBottom: 15,
  },
  input: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
    color: '#212121',
  },
  genreContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingVertical: 15,
    marginBottom: 15,
  },
  genreLabel: {
    fontSize: 16,
    color: '#212121',
    marginBottom: 5,
  },
  genreSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  genreText: {
    fontSize: 16,
    color: '#666',
  },
  commentContainer: {
    marginBottom: 30,
  },
  commentLabel: {
    fontSize: 16,
    color: '#212121',
    marginBottom: 10,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: '#212121',
    textAlignVertical: 'top',
    minHeight: 80,
  },
  saveButton: {
    backgroundColor: 'red',
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginLeft: 35,
    marginTop: -10,
    marginBottom: 10,
  },
  inputError: {
    borderBottomColor: 'red',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalButton: {
    backgroundColor: '#E91E63',
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginTop: 15,
    width: '80%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  optionsContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  optionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  optionText: {
    fontSize: 16,
    marginLeft: 15,
  },
  cancelButton: {
    justifyContent: 'center',
    marginTop: 10,
    borderBottomWidth: 0,
  },
  cancelText: {
    color: 'red',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
