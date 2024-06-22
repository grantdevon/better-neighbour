import { SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native"
import React, { FC, useState } from "react"
import { observer } from "mobx-react-lite"
import { AuthStackParamList } from "app/navigators"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { colors } from "app/theme"
import { TouchableOpacity } from "react-native-gesture-handler"
import { Button } from "app/components"

type LoginProps = NativeStackScreenProps<AuthStackParamList, "Login">

export const Login: FC<LoginProps> = observer(({ navigation }) => {
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainContent}>
        <Text style={styles.title}>Welcome!</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={email}
            placeholder="email"
            placeholderTextColor={colors.palette.ctaHelper}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.textInput}
            value={password}
            secureTextEntry
            placeholder="password"
            placeholderTextColor={colors.palette.secondary100}
            onChangeText={setPassword}
          />
        </View>
        <Button text="Login" preset="filled" style={styles.button} />
      </View>

      <TouchableOpacity
        style={styles.signUpContainer}
        onPress={() => navigation.navigate("SignUp")}
      >
        <Text style={styles.signUpText}>Don't have an account?</Text>
        <Text style={[styles.signUpText, { color: colors.palette.cta, paddingLeft: 7 }]}>
          Sign up
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "space-between",
  },
  signUpContainer: {
    flexDirection: "row",
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  signUpText: { textAlign: "center", color: colors.palette.ctaHelper, fontSize: 15 },
  baseTextColor: { color: colors.text },
  title: { color: colors.palette.ctaHelper, fontSize: 30, textAlign: "center", marginBottom: 50 },
  mainContent: { marginTop: 30 },
  inputContainer: { marginTop: 30 },
  textInput: {
    backgroundColor: colors.palette.secondary300,
    marginVertical: 10,
    marginHorizontal: 20,
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderRadius: 7,
    color: colors.text,
  },
  button: {
    marginVertical: 30,
    marginHorizontal: 20,
  },
})
