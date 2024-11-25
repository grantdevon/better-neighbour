import { ActivityIndicator, Alert, SafeAreaView, StyleSheet, TextInput, View } from "react-native"
import React, { FC, useState } from "react"
import { observer } from "mobx-react-lite"
import { AuthStackParamList } from "app/navigators"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { colors } from "app/theme"
import { TouchableOpacity } from "react-native-gesture-handler"
import { Button, Screen, Text } from "app/components"
import { firebaseModel } from "app/services/Firebase/firebase.service"

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

  if (loading)
    return (
      <SafeAreaView style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size={50} />
        <Text text="Please wait" preset="subheading" />
      </SafeAreaView>
    )

  return (
    <Screen safeAreaEdges={["top", "bottom"]} style={styles.container}>
      <View style={styles.mainContent}>
        <Text text="Welcome" preset="heading" size="xl" style={{paddingLeft: 20}}/>
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
        <Button text="Login" preset="filled" style={styles.button} onPress={signInUser} />
        <TouchableOpacity style={styles.forgotPassword}>
          <Text preset="subheading" text="forgot password?" size="sm" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.signUpContainer}
        onPress={() => navigation.navigate("SignUp")}
      >
        <Text text="Don't have an account?" preset="subheading" size="sm" />
        <Text
          text="Sign up"
          preset="subheading"
          size="sm"
          style={[styles.signUpText, { color: colors.palette.neutral900, paddingLeft: 7 }]}
        />
      </TouchableOpacity>
    </Screen>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  signUpContainer: {
    flexDirection: "row",
    marginTop: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  signUpText: { textAlign: "center", color: colors.palette.neutral300, fontSize: 15 },
  baseTextColor: { color: colors.text },
  title: { color: colors.palette.neutral300, fontSize: 30, textAlign: "center", marginBottom: 50 },
  mainContent: { marginTop: 30 },
  inputContainer: { marginTop: 30 },
  textInput: {
    backgroundColor: colors.palette.neutral100,
    marginVertical: 10,
    marginHorizontal: 20,
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderRadius: 7,
  },
  button: {
    marginVertical: 30,
    marginHorizontal: 20,
  },
  forgotPassword: {
    alignItems: "center",
  },
})
