import React, { useState, useEffect } from "react"
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useStores } from "app/models"
import { observer } from "mobx-react-lite"
import firestore, { getDocs } from "@react-native-firebase/firestore"

// Set this to true to make communities free for all users
const COMMUNITIES_FREE_OVERRIDE = true

const isLocked: boolean = true

export const CommunityFeed = observer(({ navigation }) => {
  const {
    userStore: { user },
  } = useStores()
  const [communities, setCommunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [isPremiumUser, setIsPremiumUser] = useState(false)

  useEffect(() => {
    const checkPremiumStatus = async () => {
      // Implement your premium check logic here
      // This is just a placeholder - you would check your subscription database
      // For now, we'll use the override flag
      setIsPremiumUser(COMMUNITIES_FREE_OVERRIDE || false)
    }

    const fetchCommunities = async () => {
      try {
        // Get user's communities
        const userCommunitiesSnapshot = await firestore()
          .collection("UserCommunities")
          .where("userId", "==", user.id)
          .get()

        const communityIds = userCommunitiesSnapshot.docs.map((doc) => doc.data().communityId)

        if (communityIds.length === 0) {
          setLoading(false)
          return
        }

        // Fetch the actual community data
        const communitiesData = []

        for (const communityId of communityIds) {
          // Get community details
          const communityDoc = await firestore()
            .collection("Communities")
            .where("id", "==", communityId)
            .get()

          if (!communityDoc.empty) {
            const communityData = communityDoc.docs[0].data()

            // Get last message
            const lastMessageSnapshot = await firestore()
              .collection("CommunityMessages")
              .where("communityId", "==", communityId)
              .orderBy("timestamp", "desc")
              .limit(1)
              .get()

            let lastMessage = null

            if (!lastMessageSnapshot.empty) {
              lastMessage = lastMessageSnapshot.docs[0].data()
            }

            communitiesData.push({
              ...communityData,
              lastMessage: lastMessage,
            })
          }
        }

        setCommunities(communitiesData)
      } catch (error) {
        console.error("Error fetching communities:", error)
      } finally {
        setLoading(false)
      }
    }

    checkPremiumStatus()
    fetchCommunities()
  }, [user])

  const navigateToCommunityChat = (community) => {
    navigation.navigate("CommunityChat", {
      communityId: community.id,
      communityName: community.name,
    })
  }

  const renderCommunityItem = ({ item }) => {
    return (
      <TouchableOpacity style={styles.communityItem} onPress={() => navigateToCommunityChat(item)}>
        <Image
          source={{ uri: item.profilePicture || "https://via.placeholder.com/50" }}
          style={styles.profilePicture}
        />
        <View style={styles.communityInfo}>
          <Text style={styles.communityName}>{item.name}</Text>
          <Text style={styles.lastMessage}>
            {item.lastMessage
              ? `${item.lastMessage.senderName}: ${
                  item.lastMessage.mediaUrl
                    ? "[Image]"
                    : item.lastMessage.location
                    ? "[Location]"
                    : item.lastMessage.content.substring(0, 30) +
                      (item.lastMessage.content.length > 30 ? "..." : "")
                }`
              : "No messages yet"}
          </Text>
        </View>
      </TouchableOpacity>
    )
  }

  const navigateToCreateCommunity = () => {
    navigation.navigate("CreateCommunity")
  }

  const navigateToJoinCommunity = () => {
    navigation.navigate("JoinCommunity")
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    )
  }

  if (!isPremiumUser && !COMMUNITIES_FREE_OVERRIDE) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.premiumMessage}>Communities is a premium feature</Text>
        <TouchableOpacity style={styles.upgradeButton}>
          <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (isLocked) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          {
            justifyContent: "center",
          },
        ]}
      >
        <Text
          style={{
            textAlign: "center",
            verticalAlign: "middle",
            fontSize: 16,
            fontWeight: "bold",
          }}
        >
          This feature is coming soon! ❤️
        </Text>
        <Text
          style={{
            textAlign: "center",
            verticalAlign: "middle",
            fontSize: 12,
            paddingTop: 10
            // fontWeight: "bold",
          }}
        >
          Keep watching this page for updates! 👮🏻‍♀️
        </Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {communities.length === 0 ? (
        <View style={styles.emptyCommunities}>
          <Text style={styles.emptyCommunitiesText}>You are not part of any communities yet.</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={navigateToCreateCommunity}>
              <Text style={styles.actionButtonText}>Create Community</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={navigateToJoinCommunity}>
              <Text style={styles.actionButtonText}>Join Community</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
          <FlatList
            data={communities}
            renderItem={renderCommunityItem}
            keyExtractor={(item) => item.id}
            style={styles.list}
          />
          <TouchableOpacity style={styles.floatingButton} onPress={navigateToCreateCommunity}>
            <Text style={styles.floatingButtonText}>+</Text>
          </TouchableOpacity>
        </>
      )}
    </SafeAreaView>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  premiumMessage: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
  upgradeButton: {
    backgroundColor: "#007BFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  upgradeButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  list: {
    flex: 1,
  },
  communityItem: {
    flexDirection: "row",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    backgroundColor: "white",
    alignItems: "center",
  },
  profilePicture: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  communityInfo: {
    flex: 1,
  },
  communityName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  lastMessage: {
    fontSize: 14,
    color: "#757575",
  },
  emptyCommunities: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyCommunitiesText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  actionButton: {
    backgroundColor: "#007BFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  actionButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  floatingButton: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#007BFF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  floatingButtonText: {
    color: "white",
    fontSize: 30,
  },
})
