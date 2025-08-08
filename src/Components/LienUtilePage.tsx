import { LienUtileType } from '@/app/lien-utile'
import { StyleSheet, View } from 'react-native'
import LienUtileItem from './LienUtileItem'

const LienUtilePage = ({ lienUtiles }: { lienUtiles: LienUtileType[] }) => {
  return (
    <View style={styles.container}>
      {lienUtiles.map((lienUtile) => (
        <LienUtileItem key={lienUtile.id} lienUtile={lienUtile} />
      ))}
    </View>
  )
}

export default LienUtilePage

const styles = StyleSheet.create({
    container: {
        margin: 20,
    },
})

