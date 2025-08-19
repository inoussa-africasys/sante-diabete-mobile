import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DiabetesTypeBadge from '@/src/Components/DiabetesTypeBadge';

export default function EditFicheScreen() {
  return (
    <SafeAreaView>
      <Text>Erreur : ID du patient manquant</Text>
      <DiabetesTypeBadge />
    </SafeAreaView>
  );
}