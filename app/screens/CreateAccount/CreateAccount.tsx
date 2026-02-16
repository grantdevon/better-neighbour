import { observer } from "mobx-react-lite"
import { SafeAreaView, StyleSheet, View, Image } from "react-native"
import { Text, Button } from "app/components"
import React from "react"
import { uiColors } from "app/utils/uiColors"

export const CreateAccount = observer(({ navigation }: { navigation: any }) => {
  const handleSignUp = () => {
    navigation.navigate("SignUp")
  }

  const handleLogin = () => {
    navigation.navigate("Login")
  }

  return (
    <SafeAreaView style={styles.container}>
      <View></View>
      <View>
        <Image
          source={require("../../../assets/images/logo5.png")}
          style={styles.logo}
          resizeMode={"cover"}
        />
      </View>

      <View style={styles.secondContainer}>
        <View style={{ alignItems: "center" }}>
          <Text style={styles.text}>create your</Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.textLogo}>better-neighbour </Text>
          </View>
          <Text style={styles.text}>account</Text>
          <Text style={styles.description}>
            become a better neighbour today and keep your community safe👮🏻‍♀️
          </Text>
        </View>

        <Button preset="filled" text="Sign up" style={styles.button} onPress={handleSignUp} />
        <Button preset="outline" text="Login" style={styles.button} onPress={handleLogin} />
      </View>
    </SafeAreaView>
  )
})

const styles = StyleSheet.create({
  button: {
    marginHorizontal: 20,
    marginVertical: 10,
  },
  container: {
    backgroundColor: "#fff",
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: 50,
  },
  description: {
    fontSize: 12,
    fontWeight: "200",
    marginHorizontal: 50,
    marginVertical: 5,
    textAlign: "center",
  },
  logo: {
    alignSelf: "center",
    height: 70,
    objectFit: "contain",
    width: "100%",
  },
  secondContainer: {},
  text: {
    fontSize: 36,
    fontWeight: "500",
    paddingVertical: 7,
    textAlign: "center"
  },
  textLogo: {
    color: uiColors.primary,
    fontSize: 36,
    fontWeight: "500",
    paddingVertical: 15,
    textAlign: "center",
  },
})
