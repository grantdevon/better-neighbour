import { observer } from "mobx-react-lite"
import { View, SafeAreaView, StyleSheet, Animated, Easing } from "react-native"
import { Text, Button } from "app/components"
import Icon from "react-native-vector-icons/Ionicons"
import { uiColors } from "app/utils/uiColors"
import { useEffect, useRef } from "react"
import { requestNotifications } from "react-native-permissions"

export const NotificationPermission = observer(({ navigation }) => {
  // Animation value for the icon
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

  const handleAllowNotifications = async () => {
    try {
      const { status } = await requestNotifications(["alert", "sound", "badge"])
      // Handle the permission status
      console.log("Notification permission status:", status)
      // You can add your logic here based on the status
      navigation.navigate("LocationsPermission")
    } catch (error) {
      console.error("Error requesting notification permission:", error)
      navigation.navigate("LocationsPermission")
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Two things and we're done</Text>
          <Text style={styles.subtitle}>First, we need access to your notifications</Text>
          <Text style={styles.description}>
            This will allow us to send you notifications about the nearest reports
          </Text>
        </View>

        <View style={styles.iconContainer}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Icon name="notifications-outline" size={100} color={uiColors.primary} />
          </Animated.View>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            preset="filled"
            text="Allow Notifications"
            onPress={handleAllowNotifications}
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
