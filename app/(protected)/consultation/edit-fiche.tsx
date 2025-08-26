import DiabetesTypeBadge from '@/src/Components/DiabetesTypeBadge';
import { StatusBar, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditFicheScreen() {
  return (
    <SafeAreaView>
      <StatusBar backgroundColor="#f00" barStyle="light-content" />
      <Text>Erreur : ID du patient manquant</Text>
      <DiabetesTypeBadge />
    </SafeAreaView>
  );
}