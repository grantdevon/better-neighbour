import React from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { colors } from "app/theme"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { formatToLocalTime } from "app/utils/formatDate"

export const ReportCard = ({ item, onPress }) => {
  console.log('====================================');
  console.log(item);
  console.log('====================================');
  // Get icon based on report type
  const getReportIcon = (type) => {
    switch (type.toLowerCase()) {
      case "crime":
        return "alert-octagon"
      case "suspicious activity":
        return "alert"
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

        <TouchableOpacity style={styles.viewButton} onPress={onPress}>
          <Text style={styles.viewButtonText}>View Details</Text>
          <MaterialCommunityIcons
            name="chevron-right"
            size={20}
            color={colors.palette.neutral100}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: colors.palette.neutral100,
    borderRadius: 16,
    marginVertical: 6,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.palette.neutral800,
  },
  time: {
    fontSize: 12,
    color: colors.palette.neutral500,
  },
  typeContainer: {
    marginBottom: 8,
  },
  reportType: {
    fontSize: 14,
    fontWeight: "600",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  location: {
    fontSize: 14,
    color: colors.palette.neutral600,
    marginLeft: 4,
  },
  description: {
    fontSize: 14,
    color: colors.palette.neutral700,
    marginBottom: 12,
    lineHeight: 20,
  },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.palette.primary400,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  viewButtonText: {
    color: colors.palette.neutral100,
    fontSize: 14,
    fontWeight: "600",
    marginRight: 4,
  },
})
