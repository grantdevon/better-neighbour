import { Alert, SafeAreaView, StyleSheet, Text, View, ScrollView } from "react-native"
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

type settingsProps = NativeStackScreenProps<AppStackParamList, "Settings">

interface ActionProps {
  title: string
  icon?: string
  action: () => any
}

export const Settings: FC<settingsProps> = observer(() => {
  const {
    userStore: { getUser, signOut, user },
  } = useStores()

  // Use state to manage the action array
  const [actionArray, setActionArray] = useState<ActionProps[]>([
    { title: "Share", icon: "share", action: () => {} },
    { title: "Donate", icon: "gift", action: () => {} },
    { title: "Sign out", icon: "log-out", action: () => signOutUser() },
    { title: "Delete my account", icon: "trash", action: () => {} },
  ])

  const [loading, setLoading] = useState<boolean>(true)

  const Profile = ({ user }: { user: User }) => {
    return (
      <View style={styles.profileContainer}>
        <View style={styles.profileDetails}>
          <Text style={styles.profileTitle}>{user.firstName + " " + user.lastName}</Text>
          <Text style={styles.details}>Better Neighbour since {user.dateJoined}</Text>
          <Text style={styles.details}>
            Email verified {auth().currentUser?.emailVerified ? "✅" : "❌"}
          </Text>
        </View>

        <View style={styles.profileTrustPointsContainer}>
          <Text style={styles.trustPointsTitle}>Trust Points</Text>
          <Text style={styles.trustPoints}>{user.trustPoints}</Text>
        </View>
      </View>
    )
  }

  const ActionItem = ({ action }: { action: ActionProps }) => {
    return (
      <View>
        <TouchableOpacity style={styles.action} onPress={action.action}>
          <Icon style={styles.actionIcon} name={action.icon} size={17} />
          <Text style={styles.actionText}>{action.title}</Text>
        </TouchableOpacity>
        <View style={styles.actionSeparator} />
      </View>
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
    Alert.alert("Are you sure you want to sign out?", undefined, [
      {
        text: "Yes",
        onPress: () => signOut(),
      },
      { text: "Cancel", onPress: () => {} },
    ])
  }

  const verifyEmail = async (): Promise<void> => {
    try {
      await auth().currentUser?.sendEmailVerification()
      Alert.alert("Please check your email to complete the verification process")
    } catch (error) {
      Alert.alert("An error occurred, please try again later.")
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
            const newArray = [...prevArray]
            newArray.unshift({ title: "Verify Email", icon: "mail", action: () => verifyEmail() })
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
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Profile user={user} />
        <Actions />
      </ScrollView>
    </SafeAreaView>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  actionsContainer: { flex: 1, marginVertical: 20 },
  action: {
    marginTop: 13,
    marginBottom: 5,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    marginHorizontal: 10,
  },
  actionText: { fontWeight: "bold" },
  actionIcon: { paddingLeft: 17, paddingRight: 27, justifyContent: "center" },
  actionSeparator: { borderWidth: 0.5, marginHorizontal: 17 },
  profileContainer: {
    marginBottom: 10,
    marginTop: 30,
  },
  profileDetails: {
    justifyContent: "center",
    alignItems: "center",
  },
  profileTitle: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 10,
  },
  profileTrustPointsContainer: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    paddingVertical: 20,
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 7,
  },
  trustPointsTitle: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 5,
  },
  details: {
    marginBottom: 5,
  },
  trustPoints: {
    color: colors.palette.primary,
  },
})
