/**
 * The app navigator (formerly "AppNavigator" and "MainNavigator") is used for the primary
 * navigation flows of your app.
 * Generally speaking, it will contain an auth flow (registration, login, forgot password)
 * and a "main" flow which the user will use once logged in.
 */
import { DarkTheme, DefaultTheme, NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator, NativeStackScreenProps } from "@react-navigation/native-stack"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { useColorScheme } from "react-native"
import * as Screens from "app/screens"
import Config from "../config"
import { navigationRef, useBackButtonHandler } from "./navigationUtilities"
import { colors } from "app/theme"
import auth from "@react-native-firebase/auth"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import Icon from "react-native-vector-icons/Ionicons"

/**
 * This type allows TypeScript to know what routes are defined in this navigator
 * as well as what properties (if any) they might take when navigating to them.
 *
 * If no params are allowed, pass through `undefined`. Generally speaking, we
 * recommend using your MobX-State-Tree store(s) to keep application state
 * rather than passing state through navigation params.
 *
 * For more information, see this documentation:
 *   https://reactnavigation.org/docs/params/
 *   https://reactnavigation.org/docs/typescript#type-checking-the-navigator
 *   https://reactnavigation.org/docs/typescript/#organizing-types
 */
export type AppStackParamList = {
  Home: undefined
  Map: undefined
  Settings: undefined

  // 🔥 Your screens go here
  // IGNITE_GENERATOR_ANCHOR_APP_STACK_PARAM_LIST
}

export type AuthStackParamList = {
  Welcome: undefined
  Login: undefined
  SignUp: undefined
}

/**
 * This is a list of all the route names that will exit the app if the back button
 * is pressed while in that screen. Only affects Android.
 */
const exitRoutes = Config.exitRoutes

export type AppStackScreenProps<T extends keyof AppStackParamList> = NativeStackScreenProps<
  AppStackParamList,
  T
>

// Documentation: https://reactnavigation.org/docs/stack-navigator/
const Stack = createNativeStackNavigator<AppStackParamList>()
const Tab = createBottomTabNavigator<AppStackParamList>()

const AuthStackNavigator = createNativeStackNavigator<AuthStackParamList>()

const AppStack = observer(function AppStack() {
  return (
    <Tab.Navigator screenOptions={{tabBarActiveTintColor: colors.palette.cta, tabBarShowLabel: false,}}>
      <Tab.Screen
        name="Home"
        component={Screens.Home}
        options={{
          headerShown: false,
          tabBarIcon: ({color}) => <Icon name="home" size={20} color={color}/>,
        }}
      />
      <Tab.Screen
        name="Map"
        component={Screens.Map}
        options={{
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <Icon name="map" size={20} color={color}/>
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={Screens.Settings}
        options={{
          headerShown: false,
          tabBarIcon: ({color}) => <Icon name="settings" size={20} color={color}/>,
        }}
      />
    </Tab.Navigator>
  )
})

const AuthStack = observer(function AuthStack() {
  return (
    <AuthStackNavigator.Navigator
      screenOptions={{ headerShown: false, navigationBarColor: colors.background }}
    >
      {/* <AuthStackNavigator.Screen name="Welcome" component={Screens.WelcomeScreen} /> */}
      <AuthStackNavigator.Screen name="Login" component={Screens.Login} />
      <AuthStackNavigator.Screen name="SignUp" component={Screens.SignUp} />
    </AuthStackNavigator.Navigator>
  )
})

export interface NavigationProps
  extends Partial<React.ComponentProps<typeof NavigationContainer>> {}

export const AppNavigator = observer(function AppNavigator(props: NavigationProps) {
  const colorScheme = useColorScheme()
  useBackButtonHandler((routeName) => exitRoutes.includes(routeName))

  const [initializing, setInitializing] = useState<boolean>(true)
  const [user, setUser] = useState<boolean>()

  function onAuthStateChanged(user) {
    setUser(user)
    if (initializing) setInitializing(false)
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged)
    return subscriber
  }, [])

  if (initializing) return null

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}
      {...props}
    >
      {!user ? <AuthStack /> : <AppStack />}
    </NavigationContainer>
  )
})
