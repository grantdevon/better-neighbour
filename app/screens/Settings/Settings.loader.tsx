import { SafeAreaView, StyleSheet, View } from "react-native"
import React from "react"
import ContentLoader, { Circle, Rect } from "react-content-loader/native"
import { colors } from "app/theme"

const SettingsLoader = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ContentLoader speed={2} backgroundColor={colors.palette.secondary100}>
        <Rect x="0" y="17" rx="20" ry="20" width="100%" height="200" />
        <Rect x="0" y="250" rx="20" ry="20" width="100%" height="80" />
        <Rect x="0" y="350" rx="20" ry="20" width="100%" height="80" />
        <Rect x="0" y="450" rx="20" ry="20" width="100%" height="80" />
        <Rect x="0" y="550" rx="20" ry="20" width="100%" height="80" />
      </ContentLoader>
     </SafeAreaView>
  )
}

export default SettingsLoader

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 10,
    marginTop: 20
    // flex: 1,
  },
})
