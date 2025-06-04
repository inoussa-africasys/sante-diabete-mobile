import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface FormData {
  nom: string;
  prenom: string;
  dateNaissance: string;
  genre: string;
  profession: string;
  telephone: string;
  email: string;
  commentaire: string;
}

export default function NouveauPatientScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    nom: '',
    prenom: '',
    dateNaissance: '',
    genre: '',
    profession: '',
    telephone: '',
    email: '',
    commentaire: ''
  });

  const handleSave = () => {
    console.log('Enregistrer patient:', formData);
    router.back();
  };

  const handlePhotoPress = () => {
    // TODO: Implémenter la prise de photo
    console.log('Prendre une photo');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nouveau Patient</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content}>
        {/* Photo */}
        <View style={styles.photoContainer}>
          <TouchableOpacity style={styles.photoButton} onPress={handlePhotoPress}>
            <Image 
              source={require('../assets/images/user-icon.png')} 
              style={styles.photoImage}
            />
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
              style={styles.input}
              placeholder="Nom*"
              value={formData.nom}
              onChangeText={(text) => setFormData({...formData, nom: text})}
            />
          </View>

          <View style={styles.inputContainer}>
            <FontAwesome5 name="user" size={20} color="#666" />
            <TextInput
              style={styles.input}
              placeholder="Prénom*"
              value={formData.prenom}
              onChangeText={(text) => setFormData({...formData, prenom: text})}
            />
          </View>

          <View style={styles.inputContainer}>
            <FontAwesome5 name="calendar" size={20} color="#666" />
            <TextInput
              style={styles.input}
              placeholder="Date de naissance"
              value={formData.dateNaissance}
              onChangeText={(text) => setFormData({...formData, dateNaissance: text})}
            />
          </View>

          <TouchableOpacity style={styles.genreContainer}>
            <Text style={styles.genreLabel}>Genre</Text>
            <View style={styles.genreSelector}>

              <Picker
                selectedValue={formData.genre}
                onValueChange={(itemValue, itemIndex) => setFormData({...formData, genre: itemValue})}
                style={{ height: 50, width: 200 }}
              >
                <Picker.Item label="Sélectionner le genre" />
                <Picker.Item label="Masculin" value="masculin" />
                <Picker.Item label="Feminin" value="feminin" />
              </Picker>

              <FontAwesome5 name="chevron-right" size={16} color="#666" />
            </View>
          </TouchableOpacity>

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
              style={styles.input}
              placeholder="Numéro de Téléphone"
              value={formData.telephone}
              onChangeText={(text) => setFormData({...formData, telephone: text})}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <FontAwesome5 name="envelope" size={20} color="#666" />
            <TextInput
              style={styles.input}
              placeholder="Adresse email"
              value={formData.email}
              onChangeText={(text) => setFormData({...formData, email: text})}
              keyboardType="email-address"
            />
          </View>

          <View style={styles.commentContainer}>
            <Text style={styles.commentLabel}>Commentaire</Text>
            <TextInput
              style={styles.commentInput}
              placeholder="Un petit commentaire sur le patient"
              value={formData.commentaire}
              onChangeText={(text) => setFormData({...formData, commentaire: text})}
              multiline
              numberOfLines={3}
            />
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>ENREGISTRER</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    paddingTop: 40,
    paddingBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
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
    backgroundColor: '#E91E63',
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
});
