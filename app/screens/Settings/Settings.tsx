import { Alert, SafeAreaView, StyleSheet, View, Share } from "react-native"
import React, { FC, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { SettingsStackParamList } from "app/navigators"
import { TouchableOpacity } from "react-native-gesture-handler"
import Icon from "react-native-vector-icons/Ionicons"
import { colors } from "app/theme"
import { User } from "app/models/User/User"
import { useStores } from "app/models"
import auth from "@react-native-firebase/auth"
import SettingsLoader from "./Settings.loader"
import { Screen, Text } from "app/components"
import { firebaseModel } from "app/services/Firebase/firebase.service"
import { uiColors } from "app/utils/uiColors"

type settingsProps = NativeStackScreenProps<SettingsStackParamList, "Settings">

interface ActionProps {
  title: string
  icon?: string
  action: () => any
  type?: "danger" | "primary" | "secondary"
}

const pkg = require("../../../package.json")

const appVersion = pkg.version

export const Settings: FC<settingsProps> = observer(({ navigation }) => {
  const {
    userStore: { getUser, signOut, user },
  } = useStores()

  const handleSignOut = () => {
    signOut()
  }

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
      action: () => shareApplication(),
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
    Alert.alert("Alert!", "This function is disabled during beta testing.")
  }

  const shareApplication = async () => {
    try {
      const result = await Share.share({
        message:
          "🌟 Become a better neighbour and keep your community safe by joining Better Neighbor! 🌍\n\n" +
          "📲 Download the app now:\n" +
          "👉 https://play.google.com/store/apps/details?id=com.betterneighbour",
      });
  
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log("Shared with activity type: ", result.activityType);
        } else {
          console.log("App successfully shared!");
        }
      } else if (result.action === Share.dismissedAction) {
        console.log("Sharing dismissed.");
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while trying to share the app. Please try again.");
      console.error(error);
    }
  };

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
            size="xl"
            style={styles.heading}
          />
          <View style={styles.membershipContainer}>
            <Icon
              name="star"
              size={16}
              color={uiColors.primary}
              style={styles.memberIcon}
            />
            <Text
              text={`better neighbour since ${user.dateJoined}`}
              preset="formLabel"
              size="xxs"
              style={styles.memberText}
            />
          </View>
          {/* <View style={styles.verificationContainer}>
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
          </View> */}
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
            color={action.type === "danger" ? colors.palette.angry500 : uiColors.primary}
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
        { text: "Sign out", onPress: () => handleSignOut(), style: "destructive" },
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
          style: "destructive",
        },
        {
          text: "Cancel",
          onPress: () => {},
        },
      ],
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
        console.log('====================================');
        console.log(user);
        console.log('====================================');
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
          text={`app version: ${appVersion}`}
          preset="formHelper"
          size="xxs"
          style={styles.appVersion}
        />
      </Screen>
    </SafeAreaView>
  )
})

const styles = StyleSheet.create({
  action: {
    alignItems: "center",
    backgroundColor: colors.palette.neutral200,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    padding: 12,
  },
  actionArrow: {
    opacity: 0.5,
  },
  actionContent: {
    alignItems: "center",
    flexDirection: "row",
  },
  actionDanger: {
    backgroundColor: colors.palette.angry100,
  },
  actionIcon: {
    marginRight: 12,
  },
  actionSecondary: {
    backgroundColor: colors.palette.neutral200,
  },
  actionText: {
    color: colors.palette.neutral800,
    fontSize: 13,
    fontWeight: "500",
  },
  actionTextDanger: {
    color: colors.palette.angry500,
  },
  actionTextSecondary: {
    color: colors.palette.neutral600,
  },
  actionsContainer: {
    backgroundColor: colors.palette.neutral100,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  appVersion: {
    fontSize: 12,
    paddingTop: 20,
    textAlign: "center"
  },
  avatarContainer: {
    backgroundColor: uiColors.primary,
    borderRadius: 40,
    height: 80,
    justifyContent: "center",
    marginVertical: 16,
    width: 80,
  },
  avatarText: {
    color: colors.palette.neutral100,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  heading: {
    color: colors.palette.neutral800,
    marginBottom: 8,
  },
  memberIcon: {
    marginRight: 6,
  },
  memberText: {
    color: colors.palette.neutral600,
  },
  membershipContainer: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 8,
  },
  profileContainer: {
    alignItems: "center",
    backgroundColor: colors.palette.neutral100,
    paddingBottom: 20,
    paddingTop: 30,
  },
  profileDetails: {
    alignItems: "center",
  },
  screen: {
    backgroundColor: colors.palette.neutral100,
    paddingTop: 15,
  },
  verificationContainer: {
    alignItems: "center",
    flexDirection: "row",
  },
  verifyIcon: {
    marginRight: 6,
  },
  verifyText: {
    fontWeight: "500",
  },
})
