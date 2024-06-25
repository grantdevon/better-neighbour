import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import React, { FC, useState } from "react"
import { observer } from "mobx-react-lite"
import { AuthStackParamList } from "app/navigators"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { useHeader } from "app/utils/useHeader"
import { colors } from "app/theme"
import { TextInput } from "react-native-gesture-handler"
import { Button } from "app/components"
import { firebaseModel } from "app/services/Firebase/firebase.service"

type SignUpProps = NativeStackScreenProps<AuthStackParamList, "SignUp">

interface User {
  firstName: string
  lastName: string
  email: string
  location: string
  password: string
  trustPoints: number
}

interface SignUpQuestionProps {
  question: string
  description?: string
  placeholder: string
  value: string
  setter: (value: string) => void
  validate: () => boolean
  isPassword: boolean
}

type Command = "next" | "back"

export const SignUp: FC<SignUpProps> = observer(({ navigation }) => {
  useHeader(
    {
      title: "Create an account",
      leftIcon: "back",
      leftIconColor: colors.palette.ctaHelper,
      onLeftPress: () => navigation.navigate("Login"),
    },
    [],
  )

  const [currentIndex, setCurrentIndex] = useState<number>(0)

  const [userDetails, setUser] = useState<User>({
    firstName: "",
    lastName: "",
    email: "",
    location: "",
    password: "",
    trustPoints: 0
  })
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false)
  const [confirmPassword, setConfirmPassword] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)

  const signUpObject: SignUpQuestionProps[] = [
    {
      question: "Tell us your first name",
      description: "Welcome!",
      placeholder: "First name",
      value: userDetails.firstName,
      setter: (value) => setUser({ ...userDetails, firstName: value }),
      isPassword: false,
      validate: () => userDetails.firstName.trim() !== "",
    },
    {
      question: "Enter your last name",
      description: `Nice to meet you ${userDetails.firstName}!`,
      placeholder: "Last name",
      value: userDetails.lastName,
      setter: (value) => setUser({ ...userDetails, lastName: value }),
      isPassword: false,
      validate: () => userDetails.lastName.trim() !== "",
    },
    {
      question: "Enter your email",
      description: `Got it ${userDetails.firstName + " " + userDetails.lastName}🫡`,
      placeholder: "Email",
      value: userDetails.email,
      setter: (value) => setUser({ ...userDetails, email: value }),
      isPassword: false,
      validate: () => validateEmail(userDetails.email),
    },
    {
      question: "Enter your location",
      description: "Almost there!",
      placeholder: "Location",
      value: userDetails.location,
      setter: (value) => setUser({ ...userDetails, location: value }),
      isPassword: false,
      validate: () => userDetails.location.trim() !== "",
    },
    {
      question: "Enter your password",
      description: `Great! Now time for the password. I wont look 🙈`,
      placeholder: "Password",
      value: userDetails.password,
      setter: (value) => setUser({ ...userDetails, password: value }),
      isPassword: true,
      validate: () => validatePassword(userDetails.password),
    },
    {
      question: "Confirm your password",
      description: "One last step!",
      placeholder: "Confirm password",
      value: confirmPassword,
      setter: setConfirmPassword,
      isPassword: true,
      validate: () => userDetails.password === confirmPassword,
    },
  ]

  const validateAnswer = (): boolean => {
    const currentQuestion = signUpObject[currentIndex]
    if (!currentQuestion.validate()) {
      if (currentQuestion.placeholder === "Email") {
        Alert.alert("Please enter a valid email address.")
      } else if (currentQuestion.placeholder === "Password") {
        Alert.alert(
          "Password must be at least 6 characters, contain an uppercase letter, a lowercase letter, a number, and a special character.",
        )
      } else if (currentQuestion.placeholder === "Confirm password") {
        Alert.alert("Passwords do not match.")
      } else {
        Alert.alert(`Please enter your ${currentQuestion.placeholder.toLowerCase()}.`)
      }
      return false
    }
    return true
  }

  const validateEmail = (email: string): boolean => {
    /**
     * check if email already exists
     */
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const validatePassword = (password: string): boolean => {
    const minLength = password.length >= 6
    const hasUppercase = /[A-Z]/.test(password)
    const hasLowercase = /[a-z]/.test(password)
    const hasNumber = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    return minLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar
  }

  const createUser = async () => {
    setLoading(true)
    firebaseModel
      .signUp(userDetails)
      .then((res) => setLoading(false))
      .catch((err) => setLoading(false))
  }
  const updateQuestion = (command: Command) => {
    if (command === "next") {
      if (!validateAnswer()) return
      if (currentIndex === signUpObject.length - 1) {
        console.log(userDetails)
        createUser()
        return
      }
      setCurrentIndex(currentIndex + 1)
    } else if (command === "back") {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const renderFormQuestion = (index: number) => {
    const signUpQuestion: SignUpQuestionProps = signUpObject[index]
    return (
      <View>
        {signUpQuestion && (
          <View style={styles.formContainer}>
            {signUpQuestion.description && (
              <Text style={styles.formDescription}>{signUpQuestion.description}</Text>
            )}
            <Text style={styles.formTitle}>{signUpQuestion.question}</Text>
            <TextInput
              style={styles.formInput}
              value={signUpQuestion.value}
              placeholder={signUpQuestion.placeholder}
              onChangeText={signUpQuestion.setter}
              placeholderTextColor={colors.palette.ctaHelper}
              inputMode={signUpQuestion.placeholder === "Email" ? "email" : "text"}
              secureTextEntry={
                signUpQuestion.isPassword &&
                !(signUpQuestion.placeholder === "Password" ? showPassword : showConfirmPassword)
              }
            />
            {signUpQuestion.isPassword && (
              <TouchableOpacity
                onPress={() => {
                  if (signUpQuestion.placeholder === "Password") {
                    setShowPassword(!showPassword)
                  } else {
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                }}
              >
                <Text style={styles.passwordToggle}>
                  {signUpQuestion.placeholder === "Password"
                    ? showPassword
                      ? "Hide"
                      : "Show"
                    : showConfirmPassword
                    ? "Hide"
                    : "Show"}{" "}
                  Password
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    )
  }

  if (loading)
    // make better design
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size={50} />
        <Text style={styles.formDescription}>Please wait...</Text>
      </SafeAreaView>
    )

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <View style={styles.indicatorContainer}>
          {signUpObject.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                index === currentIndex && { backgroundColor: colors.palette.cta },
              ]}
            />
          ))}
        </View>
        {renderFormQuestion(currentIndex)}
      </View>

      <View style={styles.buttonContainer}>
        {currentIndex !== 0 && (
          <Button
            preset="filled"
            text="Back"
            style={styles.button}
            onPress={() => updateQuestion("back")}
          />
        )}
        <Button
          preset="filled"
          text={currentIndex === signUpObject.length - 1 ? "Submit" : "Next"}
          style={styles.button}
          onPress={() => updateQuestion("next")}
        />
      </View>
    </SafeAreaView>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.palette.primary,
    paddingHorizontal: 20,
    justifyContent: "space-between",
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  indicator: {
    flex: 1,
    height: 10,
    backgroundColor: colors.palette.secondary200,
    marginHorizontal: 2,
    borderRadius: 5,
  },
  buttonContainer: {
    justifyContent: "space-around",
    flexDirection: "row",
  },
  button: {
    flex: 1,
    marginLeft: 15,
    marginRight: 15,
  },
  formContainer: {
    marginTop: 50,
    marginHorizontal: 20,
  },
  formTitle: {
    fontSize: 25,
    color: colors.text,
  },
  formDescription: {
    fontSize: 15,
    marginBottom: 7,
    color: colors.palette.secondary300,
  },
  formInput: {
    marginTop: 25,
    backgroundColor: colors.palette.secondary300,
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderRadius: 7,
    color: colors.text,
  },
  passwordToggle: {
    color: colors.palette.secondary300,
    marginVertical: 10,
  },
})
