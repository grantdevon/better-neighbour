import React, { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"
import * as ImagePicker from "expo-image-picker"
import * as Location from "expo-location"
import { FontAwesome, MaterialIcons } from "@expo/vector-icons" // Assuming you're using Expo
import { useNavigation, useRoute } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import { useStores } from "app/models"
import firestore from "@react-native-firebase/firestore"
import storage from "@react-native-firebase/storage"

const MESSAGES_PER_PAGE = 20

export const CommunityChat = observer(() => {
  const {
    userStore: { user },
  } = useStores()
  const [messages, setMessages] = useState([])
  const [messageText, setMessageText] = useState("")
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [lastVisible, setLastVisible] = useState(null)
  const [community, setCommunity] = useState(null)
  const [userRole, setUserRole] = useState("member")
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false)

  const flatListRef = useRef(null)
  const navigation = useNavigation()
  const route = useRoute()
  const { communityId, communityName } = route.params

  useEffect(() => {
    navigation.setOptions({
      title: communityName,
      headerRight: () => (
        <TouchableOpacity
          style={{ marginRight: 15 }}
          onPress={() => navigation.navigate("CommunityDetails", { communityId, communityName })}
        >
          <FontAwesome name="info-circle" size={24} color="black" />
        </TouchableOpacity>
      ),
    })

    fetchCommunityDetails()
    fetchInitialMessages()
    getUserRole()
  }, [communityId])

  const fetchCommunityDetails = async () => {
    try {
      const communityRef = firestore().collection("Communities").doc(communityId)
      const communitySnap = await communityRef.get()

      if (communitySnap.exists) {
        setCommunity(communitySnap.data())
      }
    } catch (error) {
      console.error("Error fetching community details:", error)
    }
  }

  const getUserRole = async () => {
    try {
      const userCommunityRef = firestore().collection("UserCommunities")
      const q = userCommunityRef
        .where("userId", "==", user.id)
        .where("communityId", "==", communityId)

      const snapshot = await q.get()

      if (!snapshot.empty) {
        setUserRole(snapshot.docs[0].data().role)
      }
    } catch (error) {
      console.error("Error fetching user role:", error)
    }
  }

  const fetchInitialMessages = async () => {
    try {
      setLoading(true)
      const messagesRef = firestore().collection("CommunityMessages")
      const q = messagesRef
        .where("communityId", "==", communityId)
        .orderBy("timestamp", "desc")
        .limit(MESSAGES_PER_PAGE)

      const querySnapshot = await q.get()

      const fetchedMessages = []
      querySnapshot.forEach((doc) => {
        fetchedMessages.push({ id: doc.id, ...doc.data() })
      })

      setMessages(fetchedMessages)

      if (querySnapshot.docs.length > 0) {
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1])
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
      Alert.alert("Error", "Failed to load messages")
    } finally {
      setLoading(false)
    }
  }

  const fetchMoreMessages = async () => {
    if (!lastVisible || loadingMore) return

    try {
      setLoadingMore(true)

      const messagesRef = firestore().collection("CommunityMessages")
      const q = messagesRef
        .where("communityId", "==", communityId)
        .orderBy("timestamp", "desc")
        .startAfter(lastVisible)
        .limit(MESSAGES_PER_PAGE)

      const querySnapshot = await q.get()

      const fetchedMessages = []
      querySnapshot.forEach((doc) => {
        fetchedMessages.push({ id: doc.id, ...doc.data() })
      })

      setMessages([...messages, ...fetchedMessages])

      if (querySnapshot.docs.length > 0) {
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1])
      } else {
        setLastVisible(null) // No more messages to load
      }
    } catch (error) {
      console.error("Error fetching more messages:", error)
      Alert.alert("Error", "Failed to load more messages")
    } finally {
      setLoadingMore(false)
    }
  }

  const sendMessage = async (content, mediaUrl = null, location = null) => {
    if ((!content || content.trim() === "") && !mediaUrl && !location) return

    try {
      const messageData = {
        communityId,
        senderId: user.id,
        senderName: `${user.firstName} ${user.lastName}`,
        content: content || "",
        mediaUrl: mediaUrl || null,
        location: location || null,
        timestamp: firestore.FieldValue.serverTimestamp(),
        readBy: [user.id],
      }

      await firestore().collection("CommunityMessages").add(messageData)
      setMessageText("")

      // Refresh messages to see the new one
      fetchInitialMessages()
    } catch (error) {
      console.error("Error sending message:", error)
      Alert.alert("Error", "Failed to send message")
    }
  }

  const pickImage = async () => {
    try {
      setShowAttachmentOptions(false)

      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "You need to allow access to your photos to share images",
        )
        return
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      })

      if (!result.canceled) {
        setLoading(true)
        const uploadUrl = await uploadImage(result.assets[0].uri)
        await sendMessage("", uploadUrl, null)
        setLoading(false)
      }
    } catch (error) {
      console.error("Error picking image:", error)
      Alert.alert("Error", "Failed to select image")
      setLoading(false)
    }
  }

  const uploadImage = async (uri) => {
    const response = await fetch(uri)
    const blob = await response.blob()

    const filename = `communities/${communityId}/${Date.now()}-${user.id}`
    const storageRef = storage().ref(filename)

    await storageRef.put(blob)
    return storageRef.getDownloadURL()
  }

  const shareLocation = async () => {
    try {
      setShowAttachmentOptions(false)

      const { status } = await Location.requestForegroundPermissionsAsync()

      if (status !== "granted") {
        Alert.alert("Permission Required", "You need to allow access to your location")
        return
      }

      setLoading(true)
      const location = await Location.getCurrentPositionAsync({})
      const locationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      }

      await sendMessage("Shared location", null, locationData)
      setLoading(false)
    } catch (error) {
      console.error("Error sharing location:", error)
      Alert.alert("Error", "Failed to share location")
      setLoading(false)
    }
  }

  const navigateToMap = (location) => {
    navigation.navigate("Map", { location })
  }

  const renderMessage = ({ item }) => {
    const isCurrentUser = item.senderId === user.id

    return (
      <View
        style={[
          styles.messageContainer,
          isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage,
        ]}
      >
        {!isCurrentUser && <Text style={styles.senderName}>{item.senderName}</Text>}

        {item.content ? <Text style={styles.messageText}>{item.content}</Text> : null}

        {item.mediaUrl ? (
          <TouchableOpacity
            onPress={() => navigation.navigate("ImageViewer", { imageUrl: item.mediaUrl })}
          >
            <Image source={{ uri: item.mediaUrl }} style={styles.messageImage} />
          </TouchableOpacity>
        ) : null}

        {item.location ? (
          <TouchableOpacity
            style={styles.locationButton}
            onPress={() => navigateToMap(item.location)}
          >
            <FontAwesome name="map-marker" size={16} color="white" />
            <Text style={styles.locationText}>View Location</Text>
          </TouchableOpacity>
        ) : null}

        <Text style={styles.timestamp}>
          {item.timestamp
            ? new Date(item.timestamp.toDate()).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Sending..."}
        </Text>
      </View>
    )
  }

  if (loading && messages.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : null}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        inverted
        onEndReached={fetchMoreMessages}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator size="small" color="#0000ff" style={styles.loadMoreIndicator} />
          ) : null
        }
      />

      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={styles.attachButton}
          onPress={() => setShowAttachmentOptions(!showAttachmentOptions)}
        >
          <FontAwesome name="paperclip" size={24} color="#007BFF" />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Type a message..."
          multiline
        />

        <TouchableOpacity
          style={styles.sendButton}
          onPress={() => sendMessage(messageText)}
          disabled={messageText.trim() === ""}
        >
          <FontAwesome
            name="send"
            size={24}
            color={messageText.trim() === "" ? "#B0C4DE" : "#007BFF"}
          />
        </TouchableOpacity>
      </View>

      {showAttachmentOptions && (
        <View style={styles.attachmentOptions}>
          <TouchableOpacity style={styles.attachmentOption} onPress={pickImage}>
            <FontAwesome name="image" size={24} color="#007BFF" />
            <Text style={styles.attachmentOptionText}>Image</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.attachmentOption} onPress={shareLocation}>
            <FontAwesome name="map-marker" size={24} color="#007BFF" />
            <Text style={styles.attachmentOptionText}>Location</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
    </KeyboardAvoidingView>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  messageContainer: {
    maxWidth: "80%",
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    marginHorizontal: 10,
  },
  currentUserMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#DCF8C6",
  },
  otherUserMessage: {
    alignSelf: "flex-start",
    backgroundColor: "white",
  },
  senderName: {
    fontWeight: "bold",
    marginBottom: 5,
    fontSize: 12,
  },
  messageText: {
    fontSize: 16,
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 10,
    marginVertical: 5,
  },
  timestamp: {
    fontSize: 10,
    color: "#999",
    alignSelf: "flex-end",
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "white",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  input: {
    flex: 1,
    backgroundColor: "#F0F0F0",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
  },
  attachButton: {
    padding: 10,
  },
  sendButton: {
    padding: 10,
  },
  loadMoreIndicator: {
    padding: 10,
  },
  attachmentOptions: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 10,
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  attachmentOption: {
    alignItems: "center",
    padding: 10,
  },
  attachmentOptionText: {
    marginTop: 5,
  },
  locationButton: {
    flexDirection: "row",
    backgroundColor: "#4285F4",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 5,
  },
  locationText: {
    color: "white",
    marginLeft: 5,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
})