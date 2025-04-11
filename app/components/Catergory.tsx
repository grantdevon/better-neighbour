import { Animated, View, StyleSheet, ScrollView, Pressable } from "react-native"
import { Text } from "app/components"
import { useState, useRef } from "react"
import { colors } from "app/theme"
import Ionicons from "react-native-vector-icons/Ionicons"
import useHapticFeedback from "app/utils/haptics"
import { uiColors } from "app/utils/uiColors"

interface Category {
  id: string
  name: string
  icon: string
}

const categories: Category[] = [
  { id: "1", name: "Power Outage", icon: "flash-outline" },
  { id: "2", name: "No Water", icon: "water-outline" },
  { id: "3", name: "Potholes", icon: "warning-outline" },
  { id: "4", name: "Internet Down", icon: "wifi-outline" },
  { id: "5", name: "Stray Pet", icon: "paw-outline" },
  { id: "6", name: "Street Lights", icon: "bulb-outline" },
  { id: "7", name: "Traffic Lights", icon: "stop-circle-outline" },
  { id: "8", name: "Strange Car", icon: "car-outline" },
  { id: "9", name: "Odd Behavior", icon: "people-outline" },
  { id: "10", name: "Crime", icon: "alert-circle-outline" },
  { id: "11", name: "Weird Activity", icon: "search-outline" },
  { id: "12", name: "Be Alert", icon: "warning-outline" },
]

interface CategoriesProps {
  onSelectCategory?: (category: Category) => void
  selectedCategory: Category | null
}

const Categories: React.FC<CategoriesProps> = ({ onSelectCategory, selectedCategory }) => {
    // const triggerHaptic = useHapticFeedback()

  const scaleAnim = useRef(new Animated.Value(1)).current
  const handlePress = (category: Category) => {
    // triggerHaptic("lightImpact")
    onSelectCategory?.(category)

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start()
  }

  return (
    <View style={styles.container}>
      <Text preset="formLabel" style={styles.title}>
        Categories {selectedCategory ? `(${selectedCategory.name})` : ""}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((category) => (
          <View key={category.id} style={styles.categoryContainer}>
            <Animated.View
              style={[
                styles.circleContainer,
                selectedCategory?.id === category.id && styles.selectedCircle,
                { transform: [{ scale: scaleAnim }] },
              ]}
            >
              <Pressable onPress={() => handlePress(category)} style={styles.pressable}>
                <Ionicons
                  name={category.icon}
                  size={24}
                  color={selectedCategory?.id === category.id ? "#FFFFFF" : uiColors.primary}
                />
              </Pressable>
            </Animated.View>
          </View>
        ))}
      </ScrollView>
    </View>
  )
}
const styles = StyleSheet.create({
  container: {
    marginTop: 15,
  },
  title: {
    marginBottom: 12,
    marginLeft: 16,
    fontSize: 13,
    fontWeight: "bold",
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  categoryContainer: {
    alignItems: "center",
    marginRight: 16,
    width: 60,
  },
  circleContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: uiColors.lightGray,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  selectedCircle: {
    backgroundColor: uiColors.primary
  },
  pressable: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    height: 20, // Fixed height for text container
    justifyContent: "center",
    alignItems: "center",
  },
  categoryText: {
    fontSize: 7,
    textAlign: "center",
    color: "#333333",
    fontWeight: "800",
    lineHeight: 10, // Added line height
  },
  selectedText: {
    color: colors.palette.primary500,
    fontWeight: "500",
  },
})

export default Categories
