import { Button, Screen, Text } from "app/components"
import { useStores } from "app/models"
import { firebaseModel } from "app/services/Firebase/firebase.service"
import { colors } from "app/theme"
import { useHeader } from "app/utils/useHeader"
import { observer } from "mobx-react-lite"
import { FC, useState } from "react"
import { ActivityIndicator, SafeAreaView, StyleSheet, TextInput, View } from "react-native"
// import analytics from "@react-native-firebase/analytics"

export const Feedback: FC = observer(({ navigation }) => {
  useHeader({
    title: "Feedback ❤️",
    leftIcon: "back",
    onLeftPress: () => navigation.navigate("Settings"),
  })

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
    <Screen safeAreaEdges={["bottom"]}>
      <View style={styles.container}>
        <Text
          text="Help us improve the app by providing critical feedback."
          preset="heading"
          weight="medium"
          size="xl"
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
})
