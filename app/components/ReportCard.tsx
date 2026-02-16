import React from "react"
import { View, Text, StyleSheet, TouchableOpacity, Share, Alert } from "react-native"
import { colors } from "app/theme"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { formatToLocalTime } from "app/utils/formatDate"

export const ReportCard = ({ item, onPress }) => {
  // Get icon based on report type
  const getReportIcon = (type) => {
    switch (type.toLowerCase()) {
      case "crime":
        return "alert-octagon"
      case "suspicious activity":
        return "alert"
      case "be alert":
        return "message-alert"
      default:
        return "information"
    }
  }

  // Get background color based on report type
  const getTypeColor = (type) => {
    switch (type.toLowerCase()) {
      case "crime":
        return "rgba(239, 68, 68, 0.1)" // red with opacity
      case "suspicious activity":
        return "rgba(234, 179, 8, 0.1)" // yellow with opacity
      case "be alert":
        return "rgba(234, 179, 8, 0.1)"
      default:
        return "rgba(59, 130, 246, 0.1)" // blue with opacity
    }
  }

  // Get text color based on report type
  const getTextColor = (type) => {
    switch (type.toLowerCase()) {
      case "crime":
        return "#DC2626"
      case "suspicious activity":
        return "#B45309"
      default:
        return "#2563EB"
    }
  }

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message:
          "🌟 Become a better neighbour and keep your community safe by joining Better Neighbor! 🌍\n\n" +
          "📲 Download the app now:\n" +
          "👉 https://play.google.com/store/apps/details?id=com.betterneighbour",
      })

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log("Shared with activity type: ", result.activityType)
        } else {
          console.log("App successfully shared!")
        }
      } else if (result.action === Share.dismissedAction) {
        console.log("Sharing dismissed.")
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while trying to share the app. Please try again.")
      console.error(error)
    }
  }

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.iconContainer, { backgroundColor: getTypeColor(item.reportType) }]}>
        <MaterialCommunityIcons
          name={getReportIcon(item.reportType)}
          size={24}
          color={getTextColor(item.reportType)}
        />
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.name}>
            {item.name} {item.lastName}
          </Text>
          <Text style={styles.time}>
            {item.time ? formatToLocalTime(item.time) : "No time available"}
          </Text>
        </View>

        <View style={styles.typeContainer}>
          <Text style={[styles.reportType, { color: getTextColor(item.reportType) }]}>
            {item.reportType}
          </Text>
        </View>

        <View style={styles.locationRow}>
          <MaterialCommunityIcons name="map-marker" size={16} color={colors.palette.neutral500} />
          <Text style={styles.location}>{item.location}</Text>
        </View>

        {item.description && (
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.viewButton} onPress={onPress}>
            <Text style={styles.viewButtonText}>View Details</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color={colors.palette.neutral100}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
             <MaterialCommunityIcons name="share" size={20} color={colors.palette.angry100} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  cardActions: {
    flexDirection: "row",
  },
  container: {
    backgroundColor: colors.palette.neutral100,
    borderRadius: 16,
    elevation: 3,
    flexDirection: "row",
    marginHorizontal: 10,
    marginVertical: 6,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  contentContainer: {
    flex: 1,
  },
  description: {
    color: colors.palette.neutral700,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  iconContainer: {
    alignItems: "center",
    borderRadius: 12,
    height: 48,
    justifyContent: "center",
    marginRight: 12,
    width: 48,
  },
  location: {
    color: colors.palette.neutral600,
    fontSize: 14,
    marginLeft: 4,
  },
  locationRow: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 8,
  },
  name: {
    color: colors.palette.neutral800,
    fontSize: 16,
    fontWeight: "600",
  },
  reportType: {
    fontSize: 14,
    fontWeight: "600",
  },
  shareButton: {
    alignItems: "center",
    backgroundColor: colors.palette.primary400,
    borderRadius: 8,
    justifyContent: "center",
    marginLeft: 10,
    paddingHorizontal: 10,
  },
  time: {
    color: colors.palette.neutral500,
    fontSize: 12,
  },
  typeContainer: {
    marginBottom: 8,
  },
  viewButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: colors.palette.primary400,
    borderRadius: 8,
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  viewButtonText: {
    color: colors.palette.neutral100,
    fontSize: 14,
    fontWeight: "600",
    marginRight: 4,
  },
})
