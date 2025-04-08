import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native"
import React, { FC, useState, useEffect } from "react"
import { observer } from "mobx-react-lite"
import { AuthStackParamList } from "app/navigators"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { colors } from "app/theme"
import { Button } from "app/components"
import { firebaseModel } from "app/services/Firebase/firebase.service"
import { Text } from "app/components"
import { uiColors } from "app/utils/uiColors"
import Ionicons from "react-native-vector-icons/Ionicons"

type SignUpProps = NativeStackScreenProps<AuthStackParamList, "SignUp">

interface User {
  firstName: string
  lastName: string
  email: string
  password: string
  trustPoints: number
  verified: boolean
}

export const SignUp: FC<SignUpProps> = observer(({ navigation }) => {
  const [userDetails, setUser] = useState<User>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    trustPoints: 0,
    verified: false,
  })
  const [confirmPassword, setConfirmPassword] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [errors, setErrors] = useState({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
    confirmPassword: false,
  })
  const [focusedInput, setFocusedInput] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false)
  const [keyboardVisible, setKeyboardVisible] = useState<boolean>(false)

  // Keyboard listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardVisible(true)
    })
    const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisible(false)
    })

    // Clean up listeners when component unmounts
    return () => {
      keyboardDidShowListener.remove()
      keyboardDidHideListener.remove()
    }
  }, [])

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const validatePassword = (password: string): boolean => {
    const minLength = password.length >= 6
    const hasUppercase = /[A-Z]/.test(password)
    const hasLowercase = /[a-z]/.test(password)
    const hasNumber = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_\[\]\-+=;'/`~|\\]/.test(password)

    return minLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar
  }

  const validateForm = (): boolean => {
    const newErrors = {
      firstName: !userDetails.firstName.trim(),
      lastName: !userDetails.lastName.trim(),
      email: !validateEmail(userDetails.email),
      password: !validatePassword(userDetails.password),
      confirmPassword: confirmPassword !== userDetails.password,
    }

    setErrors(newErrors)

    if (newErrors.firstName) {
      Alert.alert("Alert!", "Please enter your first name.")
      return false
    }

    if (newErrors.lastName) {
      Alert.alert("Alert!", "Please enter your last name.")
      return false
    }

    if (newErrors.email) {
      Alert.alert("Alert!", "Please enter a valid email address.")
      return false
    }

    if (newErrors.password) {
      const password = userDetails.password
      const issues: string[] = []

      if (password.length < 6) {
        issues.push("be at least 6 characters long")
      }
      if (!/[A-Z]/.test(password)) {
        issues.push("contain an uppercase letter")
      }
      if (!/[a-z]/.test(password)) {
        issues.push("contain a lowercase letter")
      }
      if (!/\d/.test(password)) {
        issues.push("contain a number")
      }
      if (!/[!@#$%^&*(),.?":{}|<>_\[\]\-+=;'/`~|\\]/.test(password)) {
        issues.push("contain a special character. for example: # @ ! $ %")
      }

      const errorMessage = `Password must:\n- ${issues.join("\n- ")}`
      Alert.alert("Invalid Password", errorMessage)
      return false
    }

    if (newErrors.confirmPassword) {
      Alert.alert("Alert!", "Passwords do not match.")
      return false
    }

    return true
  }

  const createUser = async () => {
    if (!validateForm()) return

    setLoading(true)
    firebaseModel
      .signUp(userDetails)
      .then((res) => setLoading(false))
      .catch((err) => {
        Alert.alert("Error", err.message || "An error occurred during sign up")
        setLoading(false)
      })
  }

  const getInputBorderColor = (inputName: string) => {
    if (errors[inputName]) return colors.error
    if (focusedInput === inputName) return uiColors.primary
    return colors.palette.neutral300
  }

  // Dismiss keyboard when tapping outside of text inputs
  const dismissKeyboard = () => {
    Keyboard.dismiss()
  }

  if (loading)
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.palette.neutral200,
        }}
      >
        <ActivityIndicator size={50} color={uiColors.primary} />
        <Text
          style={{ color: uiColors.primary, textAlign: "center" }}
          text={"Please wait..."}
          preset="heading"
        />
      </SafeAreaView>
    )

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <View style={{ flex: 1 }}>
            <ScrollView
              contentContainerStyle={{ flexGrow: 1 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View>
                <Text style={styles.formTitle}>Sign Up</Text>
                <Text style={styles.formDescription}>Create an account to get started</Text>

                <View style={{ marginTop: 7 }}>
                  <Text style={styles.formLabel}>First Name</Text>
                  <TextInput
                    value={userDetails.firstName}
                    onChangeText={(text) => {
                      setUser({ ...userDetails, firstName: text })
                      if (text.trim()) setErrors({ ...errors, firstName: false })
                    }}
                    placeholder="Enter your first name"
                    style={[styles.input, { borderColor: getInputBorderColor("firstName") }]}
                    onFocus={() => setFocusedInput("firstName")}
                    onBlur={() => {
                      setFocusedInput(null)
                      setErrors({ ...errors, firstName: !userDetails.firstName.trim() })
                    }}
                  />

                  <Text style={styles.formLabel}>Last Name</Text>
                  <TextInput
                    value={userDetails.lastName}
                    onChangeText={(text) => {
                      setUser({ ...userDetails, lastName: text })
                      if (text.trim()) setErrors({ ...errors, lastName: false })
                    }}
                    placeholder="Enter your last name"
                    style={[styles.input, { borderColor: getInputBorderColor("lastName") }]}
                    onFocus={() => setFocusedInput("lastName")}
                    onBlur={() => {
                      setFocusedInput(null)
                      setErrors({ ...errors, lastName: !userDetails.lastName.trim() })
                    }}
                  />

                  <Text style={styles.formLabel}>Email</Text>
                  <TextInput
                    value={userDetails.email}
                    onChangeText={(text) => {
                      setUser({ ...userDetails, email: text })
                      if (validateEmail(text)) setErrors({ ...errors, email: false })
                    }}
                    placeholder="Enter your email"
                    style={[styles.input, { borderColor: getInputBorderColor("email") }]}
                    onFocus={() => setFocusedInput("email")}
                    onBlur={() => {
                      setFocusedInput(null)
                      setErrors({ ...errors, email: !validateEmail(userDetails.email) })
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />

                  <Text style={styles.formLabel}>Password</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      value={userDetails.password}
                      onChangeText={(text) => {
                        setUser({ ...userDetails, password: text })
                        if (validatePassword(text)) setErrors({ ...errors, password: false })
                      }}
                      placeholder="Enter your password"
                      style={[
                        styles.passwordInput,
                        { borderColor: getInputBorderColor("password") },
                      ]}
                      onFocus={() => setFocusedInput("password")}
                      onBlur={() => {
                        setFocusedInput(null)
                        setErrors({ ...errors, password: !validatePassword(userDetails.password) })
                      }}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity
                      style={styles.passwordToggleButton}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Ionicons
                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                        size={24}
                        color={uiColors.primary}
                      />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.formLabel}>Confirm Password</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      value={confirmPassword}
                      onChangeText={(text) => {
                        setConfirmPassword(text)
                        if (text === userDetails.password)
                          setErrors({ ...errors, confirmPassword: false })
                      }}
                      placeholder="Confirm your password"
                      style={[
                        styles.passwordInput,
                        { borderColor: getInputBorderColor("confirmPassword") },
                      ]}
                      onFocus={() => setFocusedInput("confirmPassword")}
                      onBlur={() => {
                        setFocusedInput(null)
                        setErrors({
                          ...errors,
                          confirmPassword: confirmPassword !== userDetails.password,
                        })
                      }}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity
                      style={styles.passwordToggleButton}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <Ionicons
                        name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                        size={24}
                        color={uiColors.primary}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Push content up when keyboard is visible */}
              <View style={{ flex: 1, minHeight: keyboardVisible ? 100 : 20 }} />

              <View style={styles.buttonContainer}>
                <Button text="Sign Up" onPress={createUser} style={{ marginTop: 10 }} />
                <TouchableOpacity
                  onPress={() => navigation.navigate("Login")}
                  style={{
                    flexDirection: "row",
                    alignSelf: "center",
                    marginTop: 10,
                    marginBottom: 10,
                  }}
                >
                  <Text>Already have an account? </Text>
                  <Text style={{ color: uiColors.primary }}> Login</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.palette.neutral300,
    borderRadius: 10,
    padding: 10,
    paddingVertical: 15,
    marginTop: 7,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7,
  },
  passwordInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    paddingVertical: 15,
  },
  passwordToggleButton: {
    position: "absolute",
    right: 10,
    padding: 5,
  },
  formTitle: {
    fontSize: 25,
    color: colors.text,
    fontWeight: "bold",
    marginTop: 10,
  },
  formDescription: {
    fontSize: 15,
    color: colors.palette.secondary300,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
  },
  buttonContainer: {
    marginTop: 10,
  },
})
