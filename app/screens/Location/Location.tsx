import { observer } from "mobx-react-lite"
import { View, SafeAreaView, StyleSheet, Animated, Easing, Platform, Text } from "react-native"
import { uiColors } from "app/utils/uiColors"
import { Button } from "app/components"
import Icon from "react-native-vector-icons/Ionicons"
import { useEffect, useRef } from "react"
import { PERMISSIONS, request } from "react-native-permissions"

export const LocationsPermission = observer(({ navigation }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current

  // Start the pulse animation when the component mounts
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start()
  }, [])

  const requestLocationPermission = async () => {
    try {
      const permission = Platform.select({
        ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
        android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      })

      const result = await request(permission)
      console.log("====================================")
      console.log(result)
      console.log("====================================")
      navigation.navigate("CreateAccount")
    } catch (error) {
      console.error("Error requesting location permission:", error)
      navigation.navigate("CreateAccount")
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Two things and we're done</Text>
          <Text style={styles.subtitle}>Second, we need access to your Location</Text>
          <Text style={styles.description}>This will allow us to show you the nearest reports</Text>
        </View>

        <View style={styles.iconContainer}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Icon name="location-outline" size={100} color={uiColors.primary} />
          </Animated.View>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            preset="filled"
            text="Allow Location"
            onPress={requestLocationPermission}
            style={styles.button}
          />
        </View>
      </View>
    </SafeAreaView>
  )
})

const styles = StyleSheet.create({
  button: {
    marginTop: 20,
  },
  buttonContainer: {
    width: "100%",
  },
  container: {
    backgroundColor: "#fff",
    flex: 1,
  },
  content: {
    alignItems: "center",
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  description: {
    fontSize: 16,
    marginVertical: 7,
  },
  iconContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  subtitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  textContainer: {
    // alignItems: "center",
    width: "100%",
  },
  title: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "200",
    marginBottom: 10,
    textAlign: "left",
  },
})
