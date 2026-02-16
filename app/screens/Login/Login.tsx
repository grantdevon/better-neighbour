import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
  TextInput,
  View,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import React, { FC, useState } from "react"
import { observer } from "mobx-react-lite"
import { AuthStackParamList } from "app/navigators"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { colors } from "app/theme"
import { TouchableOpacity } from "react-native-gesture-handler"
import { AutoImage, Button, Screen, Text } from "app/components"
import { firebaseModel } from "app/services/Firebase/firebase.service"
import { uiColors } from "app/utils/uiColors"

type LoginProps = NativeStackScreenProps<AuthStackParamList, "Login">

export const Login: FC<LoginProps> = observer(({ navigation }) => {
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)

  const signInUser = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Validation Error", "Please fill in both email and password fields.")
      return
    }

    setLoading(true)
    try {
      await firebaseModel.signIn(email, password)
      setLoading(false)
    } catch (err) {
      setLoading(false)
      Alert.alert("Sign-In Failed", "Invalid email or password. Please try again.")
    }
  }

  const handleForgotPassword = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!email) {
      Alert.alert("Alert!", "Please enter an email address.")
      return
    }

    if (!emailRegex.test(email)) {
      Alert.alert("Alert!", "Please enter a valid email address.")
      return
    }

    try {
      await firebaseModel.forgotPassword(email)
      Alert.alert("Alert!", "Password reset link sent to your email.")
    } catch (error) {
      // Handle specific Firebase error messages
      const errorMessage = error instanceof Error ? error.message : "An error occurred"
      Alert.alert("Error", errorMessage)
    }
  }
  if (loading)
    return (
      <SafeAreaView
        style={[
          styles.container,
          {
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: colors.palette.neutral200,
          },
        ]}
      >
        <ActivityIndicator size={50} color={uiColors.primary}/>
        <Text text="Please wait" preset="subheading" />
      </SafeAreaView>
    )

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View>
        <Image
          source={require("../../../assets/images/logo5.png")}
          style={styles.logo}
          resizeMode={"cover"}
        />
      </View>
      <View>
        <Text
          text="Welcome"
          preset="heading"
          size="xl"
          style={{ paddingLeft: 20, fontWeight: "700" }}
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={email}
            placeholder="email"
            placeholderTextColor={colors.palette.secondary200}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.textInput}
            value={password}
            secureTextEntry
            placeholder="password"
            placeholderTextColor={colors.palette.secondary200}
            onChangeText={setPassword}
          />
        </View>
        <TouchableOpacity style={styles.forgotPassword} onPress={handleForgotPassword}>
          <Text
            preset="subheading"
            text="forgot password?"
            size="xs"
            style={{ color: uiColors.primary }}
          />
        </TouchableOpacity>
        <Button text="Login" preset="filled" style={styles.button} onPress={signInUser} />
        <TouchableOpacity
          style={styles.signUpContainer}
          onPress={() => navigation.navigate("SignUp")}
        >
          <Text text="Not a member?" preset="subheading" size="sm" />
          <Text
            text="Register now"
            preset="subheading"
            size="sm"
            style={[styles.signUpText, { color: uiColors.primary, paddingLeft: 7 }]}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
})

const styles = StyleSheet.create({
  baseTextColor: { color: colors.text },
  button: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  container: {
    backgroundColor: "#FFFFFF",
    flex: 1,
    justifyContent: "space-evenly",
  },
  forgotPassword: {
    // alignItems: "center",
    paddingLeft: 20,
  },
  inputContainer: { marginTop: 10 },
  logo: {
    alignSelf: "center",
    height: 70,
    objectFit: "contain",
    width: "100%",
  },
  mainContent: { marginTop: 30 },
  signUpContainer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 15,
  },
  signUpText: { color: colors.palette.neutral300, fontSize: 15, textAlign: "center" },
  textInput: {
    backgroundColor: colors.palette.neutral100,
    borderColor: "#C5C6CC",
    borderRadius: 7,
    borderWidth: 1,
    marginHorizontal: 20,
    marginVertical: 10,
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  title: { color: colors.palette.neutral300, fontSize: 30, marginBottom: 50, textAlign: "center" },
})
