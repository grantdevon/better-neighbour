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
        isPublic: isPublic,
      })

      const communityId = newCommunityDoc.id

      // Update the document with its own ID
      await communityRef.doc(communityId).update({ id: communityId })

      // Add entry to UserCommunities collection
      await firestore().collection("UserCommunities").add({
        userId: user.id,
        communityId: communityId,
        role: "admin",
        joinedAt: firestore.FieldValue.serverTimestamp(),
      })

      // Create welcome message
      await firestore()
        .collection("CommunityMessages")
        .add({
          communityId: communityId,
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
        communityId: communityId,
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
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  imagePickerContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
  },
  imagePlaceholderText: {
    color: "#999",
    marginTop: 5,
    fontSize: 12,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  radioGroup: {
    marginTop: 5,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  radioButton: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#007BFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  radioButtonSelected: {
    borderColor: "#007BFF",
  },
  radioButtonInner: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: "#007BFF",
  },
  radioLabel: {
    fontSize: 16,
  },
  createButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  createButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
})
