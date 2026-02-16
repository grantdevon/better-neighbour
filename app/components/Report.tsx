import { View, Text, TouchableOpacity, StyleSheet , Share } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { colors } from "app/theme"
import { uiColors } from "app/utils/uiColors"

const Report = ({ report }) => {
  // Function to handle share button press
  const onShare = async () => {
    try {
      await Share.share({
        message:
          "🌟 Become a better neighbour and keep your community safe by joining Better Neighbor! 🌍\n\n" +
          "📲 Download the app now:\n" +
          "👉 https://play.google.com/store/apps/details?id=com.betterneighbour",
      })
    } catch (error) {
      console.log(error.message)
    }
  }

  // Function to get icon name based on report type
  const getReportTypeIcon = (type) => {
    switch (type) {
      case "Power Outage":
        return "flash-outline"
      case "No Water":
        return "water-outline"
      case "Potholes":
        return "warning-outline"
      case "Internet Down":
        return "wifi-outline"
      case "Stray Pet":
        return "paw-outline"
      case "Street Lights":
        return "bulb-outline"
      case "Traffic Lights":
        return "stop-circle-outline"
      case "Strange Car":
        return "car-outline"
      case "Odd Behavior":
        return "people-outline"
      case "Crime":
        return "alert-circle-outline"
      case "Weird Activity":
        return "search-outline"
      case "Be Alert":
        return "warning-outline"
      case "Suspicious Activity":
        return "search-outline"
      default:
        return "alert-circle-outline"
    }
  }

  // Format date and time
  const formatDateTime = (date) => {
    const [day, month, year] = date.split("-")
    return `${day}/${month}/${year}`
  }

  const formatTime = (time) => {
    return `${time.split(" ")[0]}`
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <View style={styles.iconContainer}>
            <Ionicons name={getReportTypeIcon(report.reportType)} size={24} color="#fff" />
          </View>
          <View style={styles.nameTimeContainer}>
            <Text style={styles.name}>{report.name}</Text>
            <Text style={styles.reportType}>{report.reportType}</Text>
          </View>
        </View>
        <View style={styles.datetimeContainer}>
          <Text style={styles.datetime}>{formatTime(report.time)}</Text>
          <Text style={styles.datetime}>{formatDateTime(report.date)}</Text>
        </View>
      </View>

      <View style={styles.descriptionContainer}>
        <Text style={styles.description}>{report.description}</Text>
        <Text style={styles.location}>Location: {report.location}</Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity onPress={onShare} style={styles.shareButton}>
          <Ionicons name="share-outline" size={15} color="#fff" />
          <Text style={styles.shareButtonText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 5,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  datetime: {
    alignItems: "center",
    color: "#666",
    fontSize: 8,
  },
  datetimeContainer: {
    alignItems: "center",
  },
  description: {
    color: "#333",
    fontSize: 14,
    marginBottom: 8,
  },
  descriptionContainer: {
    marginBottom: 16,
  },
  footer: {
    borderTopColor: "#E8E8E8",
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingTop: 12,
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  iconContainer: {
    alignItems: "center",
    backgroundColor: uiColors.primary,
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  location: {
    color: "#666",
    fontSize: 12,
  },
  name: {
    fontSize: 13,
    fontWeight: "400",
    marginBottom: 2,
  },
  nameTimeContainer: {
    marginLeft: 12,
  },
  profileSection: {
    alignItems: "center",
    flexDirection: "row",
  },
  reportType: {
    color: "#666",
    fontSize: 10,
  },
  shareButton: {
    alignItems: "center",
    backgroundColor: uiColors.primary,
    borderRadius: 25,
    flexDirection: "row",
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  shareButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "400",
    marginLeft: 8,
  },
})

export default Report
