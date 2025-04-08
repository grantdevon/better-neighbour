import React, { useState, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Alert,
} from "react-native"
import {
  collection,
  query,
  where,
  getDocs,
  getFirestore,
  addDoc,
  serverTimestamp,
  updateDoc,
  arrayUnion,
  doc,
} from "firebase/firestore"

import { useNavigation } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import { useStores } from "app/models"

export const JoinCommunity = observer(() => {
  const {
    userStore: {  user },
  } = useStores()
  const [email, setEmail] = useState("")
  const [invitations, setInvitations] = useState([])
  const [publicCommunities, setPublicCommunities] = useState([])
  const [loading, setLoading] = useState(false)
  const [tabIndex, setTabIndex] = useState(0) // 0: Invitations, 1: Public, 2: Join by Email

  const db = getFirestore()
  const navigation = useNavigation()

  useEffect(() => {
    fetchInvitations()
    fetchPublicCommunities()
  }, [])

  const fetchInvitations = async () => {
    try {
      setLoading(true)

      const invitesRef = collection(db, "CommunityInvites")
      const q = query(
        invitesRef,
        where("email", "==", user.email),
        where("status", "==", "pending"),
      )

      const querySnapshot = await getDocs(q)

      const invitationsList = []
      for (const doc of querySnapshot.docs) {
        const inviteData = doc.data()

        // Get community details
        const communityRef = collection(db, "Communities")
        const communityQuery = query(communityRef, where("id", "==", inviteData.communityId))
        const communitySnapshot = await getDocs(communityQuery)

        if (!communitySnapshot.empty) {
          const communityData = communitySnapshot.docs[0].data()

          invitationsList.push({
            id: doc.id,
            ...inviteData,
            communityName: communityData.name,
            communityImage: communityData.profilePicture,
          })
        }
      }

      setInvitations(invitationsList)
    } catch (error) {
      console.error("Error fetching invitations:", error)
      Alert.alert("Error", "Failed to load invitations")
    } finally {
      setLoading(false)
    }
  }

  const fetchPublicCommunities = async () => {
    try {
      setLoading(true)

      const communitiesRef = collection(db, "Communities")
      const q = query(communitiesRef, where("isPublic", "==", true))

      const querySnapshot = await getDocs(q)

      const communitiesList = []
      for (const doc of querySnapshot.docs) {
        const communityData = doc.data()

        // Check if user is already a member
        const userCommunitiesRef = collection(db, "UserCommunities")
        const memberQuery = query(
          userCommunitiesRef,
          where("userId", "==", user.id),
          where("communityId", "==", communityData.id),
        )

        const memberSnapshot = await getDocs(memberQuery)

        // Only show communities user is not already a member of
        if (memberSnapshot.empty) {
          communitiesList.push(communityData)
        }
      }

      setPublicCommunities(communitiesList)
    } catch (error) {
      console.error("Error fetching public communities:", error)
      Alert.alert("Error", "Failed to load public communities")
    } finally {
      setLoading(false)
    }
  }

  const acceptInvitation = async (invitation) => {
    try {
      setLoading(true)

      // Update invitation status
      const inviteRef = doc(db, "CommunityInvites", invitation.id)
      await updateDoc(inviteRef, {
        status: "accepted",
      })

      // Add user to community members
      const communityRef = doc(db, "Communities", invitation.communityId)
      await updateDoc(communityRef, {
        members: arrayUnion(user.id),
      })

      // Add to UserCommunities collection
      await addDoc(collection(db, "UserCommunities"), {
        userId: user.id,
        communityId: invitation.communityId,
        role: "member",
        joinedAt: serverTimestamp(),
      })

      // Navigate to the community chat
      navigation.replace("CommunityChat", {
        communityId: invitation.communityId,
        communityName: invitation.communityName,
      })
    } catch (error) {
      console.error("Error accepting invitation:", error)
      setLoading(false)
      Alert.alert("Error", "Failed to join community")
    }
  }

  const joinPublicCommunity = async (community) => {
    try {
      setLoading(true)

      // Add user to community members
      const communityRef = doc(db, "Communities", community.id)
      await updateDoc(communityRef, {
        members: arrayUnion(user.id),
      })

      // Add to UserCommunities collection
      await addDoc(collection(db, "UserCommunities"), {
        userId: user.id,
        communityId: community.id,
        role: "member",
        joinedAt: serverTimestamp(),
      })

      // Navigate to the community chat
      navigation.replace("CommunityChat", {
        communityId: community.id,
        communityName: community.name,
      })
    } catch (error) {
      console.error("Error joining community:", error)
      setLoading(false)
      Alert.alert("Error", "Failed to join community")
    }
  }

  const joinByEmail = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter an email address")
      return
    }

    try {
      setLoading(true)

      // Check if there's an invitation for this email
      const invitesRef = collection(db, "CommunityInvites")
      const q = query(
        invitesRef,
        where("email", "==", email.trim()),
        where("status", "==", "pending"),
      )

      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        Alert.alert("Not Found", "No invitation found for this email address")
        setLoading(false)
        return
      }

      // Process the first invitation found
      const invitation = {
        id: querySnapshot.docs[0].id,
        ...querySnapshot.docs[0].data(),
      }

      // Get community details
      const communityRef = collection(db, "Communities")
      const communityQuery = query(communityRef, where("id", "==", invitation.communityId))
      const communitySnapshot = await getDocs(communityQuery)

      if (communitySnapshot.empty) {
        Alert.alert("Error", "Community not found")
        setLoading(false)
        return
      }

      const communityData = communitySnapshot.docs[0].data()

      // Update invitation status
      const inviteRef = doc(db, "CommunityInvites", invitation.id)
      await updateDoc(inviteRef, {
        status: "accepted",
      })

      // Add user to community members
      const communityDocRef = doc(db, "Communities", invitation.communityId)
      await updateDoc(communityDocRef, {
        members: arrayUnion(user.id),
      })

      // Add to UserCommunities collection
      await addDoc(collection(db, "UserCommunities"), {
        userId: user.id,
        communityId: invitation.communityId,
        role: "member",
        joinedAt: serverTimestamp(),
      })

      // Navigate to the community chat
      navigation.replace("CommunityChat", {
        communityId: invitation.communityId,
        communityName: communityData.name,
      })
    } catch (error) {
      console.error("Error joining by email:", error)
      setLoading(false)
      Alert.alert("Error", "Failed to join community")
    }
  }

  const renderInvitationItem = ({ item }) => {
    return (
      <View style={styles.itemContainer}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.communityName}</Text>
          <Text style={styles.itemSubText}>Invited by someone</Text>
        </View>
        <TouchableOpacity style={styles.joinButton} onPress={() => acceptInvitation(item)}>
          <Text style={styles.joinButtonText}>Accept</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const renderPublicCommunityItem = ({ item }) => {
    return (
      <View style={styles.itemContainer}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemSubText}>{item.members?.length || 0} members</Text>
        </View>
        <TouchableOpacity style={styles.joinButton} onPress={() => joinPublicCommunity(item)}>
          <Text style={styles.joinButtonText}>Join</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Join a Community</Text>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, tabIndex === 0 && styles.activeTab]}
          onPress={() => setTabIndex(0)}
        >
          <Text style={[styles.tabText, tabIndex === 0 && styles.activeTabText]}>Invitations</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, tabIndex === 1 && styles.activeTab]}
          onPress={() => setTabIndex(1)}
        >
          <Text style={[styles.tabText, tabIndex === 1 && styles.activeTabText]}>Public</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, tabIndex === 2 && styles.activeTab]}
          onPress={() => setTabIndex(2)}
        >
          <Text style={[styles.tabText, tabIndex === 2 && styles.activeTabText]}>
            Join by Email
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <>
          {tabIndex === 0 && (
            <>
              {invitations.length > 0 ? (
                <FlatList
                  data={invitations}
                  renderItem={renderInvitationItem}
                  keyExtractor={(item) => item.id}
                  style={styles.list}
                />
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No pending invitations</Text>
                </View>
              )}
            </>
          )}

          {tabIndex === 1 && (
            <>
              {publicCommunities.length > 0 ? (
                <FlatList
                  data={publicCommunities}
                  renderItem={renderPublicCommunityItem}
                  keyExtractor={(item) => item.id}
                  style={styles.list}
                />
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No public communities available</Text>
                </View>
              )}
            </>
          )}

          {tabIndex === 2 && (
            <View style={styles.emailContainer}>
              <Text style={styles.emailLabel}>Enter invitation email:</Text>
              <TextInput
                style={styles.emailInput}
                value={email}
                onChangeText={setEmail}
                placeholder="your@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TouchableOpacity style={styles.emailButton} onPress={joinByEmail}>
                <Text style={styles.emailButtonText}>Join Community</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 20,
    borderRadius: 5,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#007BFF",
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#F0F0F0",
  },
  activeTab: {
    backgroundColor: "#007BFF",
  },
  tabText: {
    color: "#007BFF",
    fontWeight: "500",
  },
  activeTabText: {
    color: "white",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    flex: 1,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "white",
    borderRadius: 5,
    marginBottom: 10,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  itemSubText: {
    fontSize: 14,
    color: "#757575",
  },
  joinButton: {
    backgroundColor: "#007BFF",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  joinButtonText: {
    color: "white",
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#757575",
    textAlign: "center",
  },
  emailContainer: {
    padding: 20,
    backgroundColor: "white",
    borderRadius: 5,
  },
  emailLabel: {
    fontSize: 16,
    marginBottom: 10,
  },
  emailInput: {
    backgroundColor: "#F0F0F0",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    marginBottom: 20,
  },
  emailButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: "center",
  },
  emailButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
})