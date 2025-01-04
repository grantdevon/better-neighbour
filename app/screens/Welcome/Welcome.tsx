import React from "react"
import { View, Text, StyleSheet, Dimensions, Platform } from "react-native"
import { observer } from "mobx-react-lite"
import LottieView from "lottie-react-native"
import { makeAutoObservable } from "mobx"
import { Button } from "app/components"
import InAppReview from "react-native-in-app-review"

// Welcome screen data type
interface WelcomeScreenData {
  title: string
  subtitle: string
  lottieRoute: string
  action?: () => void
}

// Store for managing welcome screen state
class WelcomeStore {
  currentScreenIndex: number = 0

  constructor() {
    makeAutoObservable(this)
  }

  nextScreen() {
    this.currentScreenIndex++
  }

  resetScreens() {
    this.currentScreenIndex = 0
  }
}

const welcomeScreens: WelcomeScreenData[] = [
  {
    title: "📍 Pin Suspicious Activity:",
    subtitle: "Report crimes or alerts to help your community.",
    lottieRoute: require("../../../assets/animations/animation1.json"),
  },
  {
    title: "🔥 Heatmap of Crime Zones",
    subtitle: " View areas with increased activity.",
    lottieRoute: require("../../../assets/animations/animation2.json"),
  },
  {
    title: "📰 Community Feed",
    subtitle: "Stay updated on nearby alerts in real time.",
    lottieRoute: require("../../../assets/animations/animation3.json"),
  },
]

const welcomeStore = new WelcomeStore()

export const Welcome = observer(({ navigation }) => {
  const currentScreen = welcomeScreens[welcomeStore.currentScreenIndex]

  const handleLogin = () => {
    if (Platform.OS === "android") {
      InAppReview.RequestInAppReview()
        .then((hasFlowFinishedSuccessfully) => {
          // when return true in android it means user finished or close review flow
          console.log("InAppReview in android", hasFlowFinishedSuccessfully)

          // when return true in ios it means review flow lanuched to user.
          console.log("InAppReview in ios has launched successfully", hasFlowFinishedSuccessfully)

          // 1- you have option to do something ex: (navigate Home page) (in android).
          // 2- you have option to do something,
          // ex: (save date today to lanuch InAppReview after 15 days) (in android and ios).

          // 3- another option:
          if (hasFlowFinishedSuccessfully) {
            // do something for ios
            // do something for android
            navigation.navigate("Login")
          }

          // for android:
          // The flow has finished. The API does not indicate whether the user
          // reviewed or not, or even whether the review dialog was shown. Thus, no
          // matter the result, we continue our app flow.

          // for ios
          // the flow lanuched successfully, The API does not indicate whether the user
          // reviewed or not, or he/she closed flow yet as android, Thus, no
          // matter the result, we continue our app flow.
        })
        .catch((error) => {
          navigation.navigate("Login")

          //we continue our app flow.
          // we have some error could happen while lanuching InAppReview,
          // Check table for errors and code number that can return in catch.
          console.log(error)
        })
    } else {
      navigation.navigate("Login")
    }
  }

  const handleNext = () => {
    if (welcomeStore.currentScreenIndex < welcomeScreens.length - 1) {
      welcomeStore.nextScreen()
    } else {
      handleLogin()
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{currentScreen.title}</Text>
        <Text style={styles.subtitle}>{currentScreen.subtitle}</Text>

        <LottieView source={currentScreen.lottieRoute} autoPlay loop style={styles.lottie} />
      </View>

      <View style={styles.buttonContainer}>
        <View style={styles.progressContainer}>
          {welcomeScreens.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                welcomeStore.currentScreenIndex === index && styles.activeDot,
              ]}
            />
          ))}
        </View>
        <Button
          preset="filled"
          onPress={handleNext}
          text={welcomeStore.currentScreenIndex < welcomeScreens.length - 1 ? "Next" : "Login"}
        />
      </View>
    </View>
  )
})

const { width, height } = Dimensions.get("window")

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 20,
  },
  lottie: {
    width: width * 0.8,
    height: height * 0.4,
  },
  textContainer: {
    alignItems: "center",
    marginVertical: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  buttonContainer: {
    width: "100%",
    marginBottom: 20,
  },
  nextButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  progressContainer: {
    flexDirection: "row",
    marginBottom: 20,
    alignSelf: "center",
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: "#007AFF",
  },
})
