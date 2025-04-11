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
import Toast from "react-native-toast-message"
import { requestUserPermission } from "app/utils/permissions"
import messaging from "@react-native-firebase/messaging"
import { uiColors } from "app/utils/uiColors"

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
  HomeTab: undefined
  HomeFeedTab: undefined
  CommunityFeedTab: undefined
  MapTab: coords | undefined
  SettingsTab: undefined

  // 🔥 Your screens go here
  // IGNITE_GENERATOR_ANCHOR_APP_STACK_PARAM_LIST
}

type coords = {
  latitude: number
  longitude: number
}

export type HomeStackParamList = {
  Home: undefined
  Locations: undefined
}

export type HomeFeedStackParamList = {
  HomeFeed: undefined
  FeedDetails: undefined
}

export type CommunityFeedStackParamList = {
  CommunityFeed: undefined
  CommunityChat: undefined
  CreateCommunity: undefined
  JoinCommunity: undefined
}

export type MapStackParamList = {
  Map: undefined
  Report: { lat: number; lng: number }
}
export type SettingsStackParamList = {
  Settings: undefined
  Feedback: undefined
}

export type AuthStackParamList = {
  Welcome: undefined
  Login: undefined
  SignUp: undefined
  NotificationPermission: undefined
  LocationsPermission: undefined
  CreateAccount: undefined
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
const HomeStackNavigator = createNativeStackNavigator<HomeStackParamList>()
const HomeFeedStackNavigator = createNativeStackNavigator<HomeFeedStackParamList>()
const CommunityFeedStackNavigator = createNativeStackNavigator<CommunityFeedStackParamList>()
const MapStackNavigator = createNativeStackNavigator<MapStackParamList>()
const SettingsStackNavigator = createNativeStackNavigator<SettingsStackParamList>()

const AuthStackNavigator = createNativeStackNavigator<AuthStackParamList>()

const HomeStack = observer(function HomeStack() {
  return (
    <HomeStackNavigator.Navigator
      screenOptions={{ headerShown: false, navigationBarColor: colors.background }}
    >
      {/* <MapStackNavigator.Screen name="Welcome" component={Screens.WelcomeScreen} /> */}
      <HomeStackNavigator.Screen name="Home" component={Screens.Home} />
      <HomeStackNavigator.Screen name="Locations" component={Screens.Locations} />
    </HomeStackNavigator.Navigator>
  )
})

const HomeFeedStack = observer(function HomeFeedStack() {
  return (
    <HomeFeedStackNavigator.Navigator
      screenOptions={{ headerShown: false, navigationBarColor: colors.background }}
    >
      <HomeStackNavigator.Screen name="Home" component={Screens.HomeFeed} />
      <HomeStackNavigator.Screen
        name="FeedDetails"
        component={Screens.FeedDetails}
        options={{
          presentation: "modal",
          animation: "slide_from_bottom",
          gestureEnabled: true,
          gestureDirection: "vertical",
        }}
      />
    </HomeFeedStackNavigator.Navigator>
  )
})

const CommunityFeedStack = observer(function CommunityFeedStack() {
  return (
    <CommunityFeedStackNavigator.Navigator
      screenOptions={{ headerShown: false, navigationBarColor: colors.background }}
    >
      <CommunityFeedStackNavigator.Screen name="CommunityFeed" component={Screens.CommunityFeed} />
      <CommunityFeedStackNavigator.Screen name="CommunityChat" component={Screens.CommunityChat} />
      <CommunityFeedStackNavigator.Screen name="CreateCommunity" component={Screens.CreateCommunity} />
      <CommunityFeedStackNavigator.Screen name="JoinCommunity" component={Screens.JoinCommunity} />
      {/* <HomeStackNavigator.Screen
        name="FeedDetails"
        component={Screens.FeedDetails}
        options={{
          presentation: "modal",
          animation: "slide_from_bottom",
          gestureEnabled: true,
          gestureDirection: "vertical",
        }}
      /> */}
    </CommunityFeedStackNavigator.Navigator>
  )
})
const MapStack = observer(function MapStack() {
  return (
    <MapStackNavigator.Navigator
      screenOptions={{ headerShown: false, navigationBarColor: colors.background }}
    >
      {/* <MapStackNavigator.Screen name="Welcome" component={Screens.WelcomeScreen} /> */}
      <MapStackNavigator.Screen name="Map" component={Screens.Map} />
      <MapStackNavigator.Screen name="Report" component={Screens.Report} />
    </MapStackNavigator.Navigator>
  )
})

const SettingsStack = observer(function SettingsStack() {
  return (
    <SettingsStackNavigator.Navigator
      screenOptions={{ headerShown: false, navigationBarColor: colors.background }}
    >
      {/* <MapStackNavigator.Screen name="Welcome" component={Screens.WelcomeScreen} /> */}
      <SettingsStackNavigator.Screen name="Settings" component={Screens.Settings} />
      <SettingsStackNavigator.Screen
        name="Feedback"
        component={Screens.Feedback}
        options={{ headerShown: false }}
      />
    </SettingsStackNavigator.Navigator>
  )
})

const AppStack = observer(function AppStack() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: uiColors.primary,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: colors.palette.neutral200,
        },
      }}
    >
      <Tab.Screen
        name="HomeFeedTab"
        component={HomeFeedStack}
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => <Icon name="home" size={20} color={color} />,
        }}
      />
      <Tab.Screen
        name="CommunityFeedTab"
        component={CommunityFeedStack}
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => <Icon name="people-circle-outline" size={20} color={color} />,
        }}
      />
      <Tab.Screen
        name="MapTab"
        component={MapStack}
        options={{
          headerShown: false,
          tabBarIcon: ({ focused, color }) => <Icon name="map" size={20} color={color} />,
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsStack}
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => <Icon name="settings" size={20} color={color} />,
        }}
      />
    </Tab.Navigator>
  )
})

const AuthStack = observer(function AuthStack() {
  return (
    <AuthStackNavigator.Navigator
      screenOptions={{ headerShown: false, navigationBarColor: colors.background }}
      initialRouteName="Welcome"
    >
      <AuthStackNavigator.Screen name="Welcome" component={Screens.Welcome} />
      <AuthStackNavigator.Screen
        name="NotificationPermission"
        component={Screens.NotificationPermission}
      />
      <AuthStackNavigator.Screen
        name="LocationsPermission"
        component={Screens.LocationsPermission}
      />
      <AuthStackNavigator.Screen name="CreateAccount" component={Screens.CreateAccount} />
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

  useEffect(() => {
    const getToken = async () => {
      const token = await messaging().getToken()
      console.log("FCM Token:", token)
    }

    getToken()
  }, [])

  useEffect(() => {
    const unsubscribe = messaging().onTokenRefresh((token) => {
      console.log("FCM Token refreshed:", token)
      // Update your backend with the new token
    })

    return unsubscribe // Cleanup the listener when the component unmounts
  }, [])

  if (initializing) return null

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}
      {...props}
    >
      {!user ? <AuthStack /> : <AppStack />}
      <Toast />
    </NavigationContainer>
  )
})
