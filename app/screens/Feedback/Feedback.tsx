import { Button, Screen, Text } from "app/components"
import { useStores } from "app/models"
import { firebaseModel } from "app/services/Firebase/firebase.service"
import { colors } from "app/theme"
import { observer } from "mobx-react-lite"
import { FC, useState } from "react"
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import Icon from "react-native-vector-icons/Ionicons"

// import analytics from "@react-native-firebase/analytics"

export const Feedback: FC = observer(({ navigation }) => {
  const {
    userStore: { user },
  } = useStores()

  const [feedback, setFeedback] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)

  /**
   * TODO: move funtion
   */
  const generateUUID = (): string => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    const uuidLength = 36
    let uuid = ""

    for (let i = 0; i < uuidLength; i++) {
      if ([8, 13, 18, 23].includes(i)) {
        uuid += "-" // Add dashes at specific positions
      } else {
        const randomIndex = Math.floor(Math.random() * characters.length)
        uuid += characters[randomIndex]
      }
    }

    return uuid
  }

  const submitFeedback = async () => {
    setLoading(true)
    await firebaseModel.sendDoc("feedback", generateUUID(), {
      feedback: feedback,
      date: new Date(),
      userId: user.id,
      name: user.firstName,
    })
    // await analytics().logEvent("submit_feedback", {
    //   id: user.id,
    //   name: user.firstName,
    // })
    navigation.navigate("Settings")
    setLoading(false)
  }

  if (loading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.palette.neutral200,
        }}
      >
        <ActivityIndicator size={"large"} color={colors.palette.neutral800} />
        <Text>Submitting your feedback...</Text>
      </SafeAreaView>
    )
  }

  return (
    <Screen safeAreaEdges={["top"]}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={24} color={colors.palette.neutral700} />
      </TouchableOpacity>

      <View style={styles.container}>
        <Text
          text="Help us improve the app by providing critical feedback."
          preset="heading"
          size="lg"
          style={{ fontSize: 15 }}
        />
        <TextInput
          maxLength={250}
          multiline
          placeholder="Provide feedback"
          value={feedback}
          onChangeText={setFeedback}
          style={styles.inputDescription}
        />
        <Button text="submit" preset="filled" style={styles.button} onPress={submitFeedback} />
      </View>
    </Screen>
  )
})

const styles = StyleSheet.create({
  inputDescription: {
    borderWidth: 1,
    borderRadius: 7,
    borderColor: "grey",
    paddingHorizontal: 10,
    paddingVertical: 20,
    paddingTop: 15,
    marginTop: 20,
    minHeight: 200,
  },
  container: {
    paddingHorizontal: 15,
  },
  button: {
    marginTop: 20,
    borderRadius: 10,
  },
  backButton: {
    width: 45,
    height: 45,
    marginHorizontal: 15,
    zIndex: 2,
    backgroundColor: colors.palette.neutral100,
    padding: 10,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 10
  },
})
