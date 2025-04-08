import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { Share } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { colors } from "app/theme"

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
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.palette.primary500,
    justifyContent: "center",
    alignItems: "center",
  },
  nameTimeContainer: {
    marginLeft: 12,
  },
  name: {
    fontSize: 13,
    fontWeight: "400",
    marginBottom: 2,
  },
  reportType: {
    fontSize: 10,
    color: "#666",
  },
  datetime: {
    fontSize: 8,
    color: "#666",
    alignItems: "center",
  },
  descriptionContainer: {
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
  },
  location: {
    fontSize: 12,
    color: "#666",
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "#E8E8E8",
    paddingTop: 12,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.palette.primary500,
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 25,
  },
  shareButtonText: {
    color: "#fff",
    marginLeft: 8,
    fontSize: 12,
    fontWeight: "400",
  },
  datetimeContainer: {
    alignItems: "center",
  },
})

export default Report
