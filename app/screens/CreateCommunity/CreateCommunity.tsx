import React, { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from "react-native"
import * as ImagePicker from "expo-image-picker"
import { collection, addDoc, getFirestore, serverTimestamp, doc, setDoc } from "firebase/firestore"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { useNavigation } from "@react-navigation/native"
import { FontAwesome } from "@expo/vector-icons"
import { observer } from "mobx-react-lite"
import { useStores } from "app/models"
import storage from "@react-native-firebase/storage"
import firestore from "@react-native-firebase/firestore"

export const CreateCommunity = observer(() => {
  const {
    userStore: { user },
  } = useStores()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isPublic, setIsPublic] = useState(false)
  const [profileImage, setProfileImage] = useState(null)
  const [loading, setLoading] = useState(false)

  const navigation = useNavigation()

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()

      if (permissionResult.granted === false) {
        Alert.alert(
          "Permission Required",
          "You need to allow access to your photos to upload a profile picture",
        )
        return
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })

      if (!result.canceled) {
        setProfileImage(result.assets[0].uri)
      }
    } catch (error) {
      console.error("Error picking image:", error)
      Alert.alert("Error", "Failed to select image")
    }
  }

  const uploadProfileImage = async () => {
    if (!profileImage) return null

    const filename = `communities/profiles/${Date.now()}-${user.id}`
    const reference = storage().ref(filename)

    // Convert URI to blob
    const response = await fetch(profileImage)
    const blob = await response.blob()

    // Upload the file
    await reference.put(blob)
    return reference.getDownloadURL()
  }

  const createCommunity = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a community name")
      return
    }

    try {
      setLoading(true)

      // Upload profile image if selected
      const profilePictureUrl = await uploadProfileImage()

      // Create community in Firestore
      const communityRef = await firestore().collection("Communities")
      const newCommunityDoc = await communityRef.add({
        name: name.trim(),
        description: description.trim(),
        profilePicture: profilePictureUrl,
        createdAt: firestore.FieldValue.serverTimestamp(),
        createdBy: user.id,
        members: [user.id],
        admins: [user.id],
        isPublic,
      })

      const communityId = newCommunityDoc.id

      // Update the document with its own ID
      await communityRef.doc(communityId).update({ id: communityId })

      // Add entry to UserCommunities collection
      await firestore().collection("UserCommunities").add({
        userId: user.id,
        communityId,
        role: "admin",
        joinedAt: firestore.FieldValue.serverTimestamp(),
      })

      // Create welcome message
      await firestore()
        .collection("CommunityMessages")
        .add({
          communityId,
          senderId: user.id,
          senderName: `${user.firstName} ${user.lastName}`,
          content: `Welcome to ${name}! This is the beginning of your community.`,
          mediaUrl: null,
          location: null,
          timestamp: firestore.FieldValue.serverTimestamp(),
          readBy: [user.id],
        })

      setLoading(false)

      // Navigate to the new community chat
      navigation.replace("CommunityChat", {
        communityId,
        communityName: name,
      })
    } catch (error) {
      console.error("Error creating community:", error)
      setLoading(false)
      Alert.alert("Error", "Failed to create community")
    }
  }

  return (
    <SafeAreaView style={{flex: 1}}>
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Create New Community</Text>

          <TouchableOpacity style={styles.imagePickerContainer} onPress={pickImage}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <FontAwesome name="camera" size={40} color="#999" />
                <Text style={styles.imagePlaceholderText}>Add community image</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Community Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter community name"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="What is this community about?"
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Privacy Setting</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity style={styles.radioOption} onPress={() => setIsPublic(false)}>
                <View style={[styles.radioButton, !isPublic && styles.radioButtonSelected]}>
                  {!isPublic && <View style={styles.radioButtonInner} />}
                </View>
                <Text style={styles.radioLabel}>Private (invite only)</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.radioOption} onPress={() => setIsPublic(true)}>
                <View style={[styles.radioButton, isPublic && styles.radioButtonSelected]}>
                  {isPublic && <View style={styles.radioButtonInner} />}
                </View>
                <Text style={styles.radioLabel}>Public (anyone can join)</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.createButton}
            onPress={createCommunity}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.createButtonText}>Create Community</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
})

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F5F5F5",
    flex: 1,
  },
  content: {
    padding: 20,
  },
  createButton: {
    alignItems: "center",
    backgroundColor: "#007BFF",
    borderRadius: 5,
    marginTop: 10,
    paddingVertical: 12,
  },
  createButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  formGroup: {
    marginBottom: 20,
  },
  imagePickerContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  imagePlaceholder: {
    alignItems: "center",
    backgroundColor: "#E0E0E0",
    borderRadius: 60,
    height: 120,
    justifyContent: "center",
    width: 120,
  },
  imagePlaceholderText: {
    color: "#999",
    fontSize: 12,
    marginTop: 5,
  },
  input: {
    backgroundColor: "white",
    borderColor: "#DDD",
    borderRadius: 5,
    borderWidth: 1,
    fontSize: 16,
    padding: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  profileImage: {
    borderRadius: 60,
    height: 120,
    width: 120,
  },
  radioButton: {
    alignItems: "center",
    borderColor: "#007BFF",
    borderRadius: 10,
    borderWidth: 2,
    height: 20,
    justifyContent: "center",
    marginRight: 10,
    width: 20,
  },
  radioButtonInner: {
    backgroundColor: "#007BFF",
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  radioButtonSelected: {
    borderColor: "#007BFF",
  },
  radioGroup: {
    marginTop: 5,
  },
  radioLabel: {
    fontSize: 16,
  },
  radioOption: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 10,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
})
