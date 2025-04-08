import React, { useEffect } from "react"
import { Image, StyleSheet, Animated, Text } from "react-native"

export function CustomSplashScreen({ onAnimationComplete }: { onAnimationComplete: () => void }) {
  const fadeAnim = new Animated.Value(0)

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      // Wait for a while
      Animated.delay(1000),
      // Fade out animation
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Call the callback when animation completes
      onAnimationComplete && onAnimationComplete()
    })
  }, [])

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Image source={require("../../../assets/images/logo5.png")} style={styles.logo} />
      <Text style={styles.title}>Better Neighbour</Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF", // Use your app's primary color
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#CCCCCC",
  },
})
