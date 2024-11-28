import { Alert, SafeAreaView, StyleSheet, View } from "react-native"
import React, { FC, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { AppStackParamList } from "app/navigators"
import { TouchableOpacity } from "react-native-gesture-handler"
import Icon from "react-native-vector-icons/Ionicons"
import { colors } from "app/theme"
import { User } from "app/models/User/User"
import { useStores } from "app/models"
import auth from "@react-native-firebase/auth"
import SettingsLoader from "./Settings.loader"
import { Screen, Text } from "app/components"
import { firebaseModel } from "app/services/Firebase/firebase.service"

type settingsProps = NativeStackScreenProps<AppStackParamList, "Settings">

interface ActionProps {
  title: string
  icon?: string
  action: () => any
  type?: "danger" | "primary" | "secondary"
}

const pkg = require("../../../package.json")

const appVersion = pkg.version

export const Settings: FC<settingsProps> = observer(({navigation}) => {
  const {
    userStore: { getUser, signOut, user },
  } = useStores()

  const [actionArray, setActionArray] = useState<ActionProps[]>([
    {
      title: "Give feedback ❤️",
      icon: "clipboard-outline",
      action: () => navigation.navigate("Feedback"),
      type: "primary",
    },
    {
      title: "Share with friends",
      icon: "share-social",
      action: () => actionDisabledAlert(),
      type: "primary",
    },
    {
      title: "Support our mission",
      icon: "heart",
      action: () => actionDisabledAlert(),
      type: "primary",
    },
    { title: "Sign out", icon: "log-out", action: () => signOutUser(), type: "secondary" },
    {
      title: "Delete my account",
      icon: "trash",
      action: () => deleteUserAccount(),
      type: "danger",
    },
  ])

  const [loading, setLoading] = useState<boolean>(true)

  const actionDisabledAlert = () => {
    Alert.alert("", "This function is disabled during beta")
  }

  const Profile = ({ user }: { user: User }) => {
    return (
      <View style={styles.profileContainer}>
        <View style={styles.avatarContainer}>
          <Text text={`${user.firstName[0]}${user.lastName[0]}`} style={styles.avatarText} />
        </View>
        <View style={styles.profileDetails}>
          <Text
            text={`${user.firstName} ${user.lastName}`}
            preset="heading"
            size="xxl"
            style={styles.heading}
          />
          <View style={styles.membershipContainer}>
            <Icon
              name="star"
              size={16}
              color={colors.palette.neutral700}
              style={styles.memberIcon}
            />
            <Text
              text={`better neighbour since ${user.dateJoined}`}
              preset="subheading"
              size="md"
              weight="medium"
              style={styles.memberText}
            />
          </View>
          <View style={styles.verificationContainer}>
            <Icon
              name={auth().currentUser?.emailVerified ? "checkmark-circle" : "alert-circle"}
              size={16}
              color={
                auth().currentUser?.emailVerified
                  ? colors.palette.primary300
                  : colors.palette.angry500
              }
              style={styles.verifyIcon}
            />
            <Text
              text={`Email ${auth().currentUser?.emailVerified ? "verified" : "not verified"}`}
              preset="subheading"
              size="md"
              weight="medium"
              style={[
                styles.verifyText,
                {
                  color: auth().currentUser?.emailVerified
                    ? colors.palette.primary300
                    : colors.palette.angry500,
                },
              ]}
            />
          </View>
        </View>
      </View>
    )
  }

  const ActionItem = ({ action }: { action: ActionProps }) => {
    return (
      <TouchableOpacity
        style={[
          styles.action,
          action.type === "danger" && styles.actionDanger,
          action.type === "secondary" && styles.actionSecondary,
        ]}
        onPress={action.action}
      >
        <View style={styles.actionContent}>
          <Icon
            name={action.icon}
            size={20}
            color={action.type === "danger" ? colors.palette.angry500 : colors.palette.primary300}
            style={styles.actionIcon}
          />
          <Text
            text={action.title}
            style={[
              styles.actionText,
              action.type === "danger" && styles.actionTextDanger,
              action.type === "secondary" && styles.actionTextSecondary,
            ]}
          />
        </View>
        <Icon
          name="chevron-forward"
          size={20}
          color={action.type === "danger" ? colors.palette.angry500 : colors.palette.neutral400}
          style={styles.actionArrow}
        />
      </TouchableOpacity>
    )
  }

  const Actions: FC = () => {
    return (
      <View style={styles.actionsContainer}>
        {actionArray.map((action, index) => (
          <ActionItem key={index} action={action} />
        ))}
      </View>
    )
  }

  const signOutUser = (): void => {
    Alert.alert(
      "Sign out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Sign out", onPress: () => signOut(), style: "destructive" },
      ],
      { cancelable: true },
    )
  }

  const deleteUserAccount = () => {
    Alert.alert(
      "Delete account?",
      "Are you sure you want to delete your account? This action cannot be reversed!",
      [
        {
          text: "Yes I am sure",
          onPress: () => firebaseModel.deleteUser(),
          style: "destructive"
        },
        {
          text: "Cancel",
          onPress: () => {}
        }
      ]
    )
  }

  const verifyEmail = async (): Promise<void> => {
    try {
      await auth().currentUser?.sendEmailVerification()
      Alert.alert(
        "Verification email sent",
        "Please check your email to complete the verification process",
      )
    } catch (error) {
      Alert.alert("Error", "An error occurred, please try again later.")
    }
  }

  useEffect(() => {
    setLoading(true)
    const id: string = auth().currentUser?.uid as string
    const hydrate = async () => {
      try {
        await getUser(id)
        if (!auth().currentUser?.emailVerified) {
          setActionArray((prevArray) => {
            const newArray = [
              { title: "Verify Email", icon: "mail", action: () => verifyEmail(), type: "primary" },
              ...prevArray,
            ]
            return newArray
          })
        }
        setLoading(false)
      } catch (error) {
        setLoading(false)
      }
    }
    hydrate()
  }, [])

  if (loading) {
    return <SettingsLoader />
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.palette.neutral100 }}>
      <Screen preset="scroll" style={styles.screen}>
        <Profile user={user} />
        <Actions />
        <Text
          text={`app version: ${appVersion} - BETA`}
          preset="subheading"
          size="xs"
          style={styles.appVersion}
        />
      </Screen>
    </SafeAreaView>
  )
})

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.palette.neutral100,
  },
  profileContainer: {
    paddingTop: 30,
    paddingBottom: 20,
    alignItems: "center",
    backgroundColor: colors.palette.neutral100,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.palette.primary300,
    justifyContent: "center",
    marginBottom: 16,
  },
  avatarText: {
    color: colors.palette.neutral100,
    fontSize: 21,
    fontWeight: "bold",
    textAlign: "center",
  },
  profileDetails: {
    alignItems: "center",
  },
  heading: {
    color: colors.palette.neutral800,
    marginBottom: 8,
  },
  membershipContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  memberIcon: {
    marginRight: 6,
  },
  memberText: {
    color: colors.palette.neutral600,
  },
  verificationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  verifyIcon: {
    marginRight: 6,
  },
  verifyText: {
    fontWeight: "500",
  },
  actionsContainer: {
    backgroundColor: colors.palette.neutral100,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  action: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.palette.neutral200,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  actionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionIcon: {
    marginRight: 12,
  },
  actionText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.palette.neutral800,
  },
  actionArrow: {
    opacity: 0.5,
  },
  actionDanger: {
    backgroundColor: colors.palette.angry100,
  },
  actionSecondary: {
    backgroundColor: colors.palette.neutral200,
  },
  actionTextDanger: {
    color: colors.palette.angry500,
  },
  actionTextSecondary: {
    color: colors.palette.neutral600,
  },
  appVersion: {
    textAlign: "center",
    paddingTop: 20,
  },
})
