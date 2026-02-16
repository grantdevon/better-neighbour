import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { AppStackParamList } from "app/navigators"
import { colors } from "app/theme"
import { observer } from "mobx-react-lite"
import { FC, useState, useEffect } from "react"
import {
  View,
  StyleSheet,
  TextInput,
  SafeAreaView,
  Alert,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Pressable,
} from "react-native"
import { useHeader } from "app/utils/useHeader"
import * as Location from "expo-location"
import Icon from "react-native-vector-icons/Ionicons"
import { fetchLocationFromCoords } from "app/utils/map"
import { Button, Text } from "app/components"
import Categories from "app/components/Catergory"
import { useStores } from "app/models"
import Report from "app/components/Report"
import { getFormattedDate } from "app/utils/formatDate"
import { uiColors } from "app/utils/uiColors"

type homeProps = NativeStackScreenProps<AppStackParamList, "HomeFeedTab">

export const HomeFeed: FC<homeProps> = observer(({ navigation }) => {
  const {
    reportStore: { getProvinceReports, reports },
    mapStore: { setMapState },
  } = useStores()

  const [location, setLocation] = useState<Location.LocationObject | null>(null)
  const [province, setProvince] = useState<string>("Cape Town")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [isFocused, setIsFocused] = useState(false)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [locationLoading, setLocationLoading] = useState<boolean>(true)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)

  // Default coordinates for Cape Town
  const defaultCoords = { lat: -33.9249, lng: 18.4241 }

  useHeader(
    {
      leftIcon: "location",
      leftIconColor: uiColors.primary,
      leftText: province,
      containerStyle: {
        backgroundColor: "white",
      },
    },
    [province],
  )

  const fetchInitialData = async () => {
    try {
      setLoading(true)
      // Use either the current location coordinates or default to Cape Town
      const coords = location
        ? { lat: location.coords.latitude, lng: location.coords.longitude }
        : defaultCoords

      await getProvinceReports("reports", getFormattedDate(), coords, province)
    } catch (error) {
      console.error("Error fetching initial data:", error)
      // Show toast for error (using your existing toast system)
      // toast.show({ type: 'error', message: 'Failed to load reports. Using default data.' })
    } finally {
      setLoading(false)
    }
  }

  const updateLocationData = async () => {
    try {
      setLocationLoading(true)
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced, // Reduced accuracy for faster response
        timeout: 5000, // 5 second timeout
      })

      setLocation(currentLocation)

      const detectedProvince = await fetchLocationFromCoords(
        currentLocation.coords.latitude,
        currentLocation.coords.longitude,
      )

      if (detectedProvince) {
        setProvince(detectedProvince)
        // Show toast that location was found (using your existing toast system)
        // toast.show({ type: 'success', message: `Location updated to ${detectedProvince}` })

        // Refresh data with the new location
        const coords = {
          lat: currentLocation.coords.latitude,
          lng: currentLocation.coords.longitude,
        }
        await getProvinceReports("reports", getFormattedDate(), coords, detectedProvince)
      }
    } catch (error) {
      console.error("Error getting location:", error)
      // Toast notification for location error (using your existing toast system)
      // toast.show({ type: 'info', message: 'Using default location: Cape Town' })
    } finally {
      setLocationLoading(false)
    }
  }

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()

      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Permission to access location was denied. Using default location: Cape Town.",
          [{ text: "OK" }],
        )
        return false
      }
      return true
    } catch (error) {
      console.error("Error requesting location permission:", error)
      return false
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    const hasPermission = await requestLocationPermission()
    if (hasPermission) {
      await updateLocationData()
    }
    await fetchInitialData()
    setRefreshing(false)
  }

  const filteredReports = reports?.filter((report) => {
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch =
      report.name.toLowerCase().includes(searchLower) ||
      report.location.toLowerCase().includes(searchLower) ||
      report.description.toLowerCase().includes(searchLower) ||
      report.reportType.toLowerCase().includes(searchLower)

    // If no category is selected, only apply search filter
    if (!selectedCategory) {
      return matchesSearch
    }

    // If category is selected, apply both search and category filters
    return matchesSearch && report.reportType.toLowerCase() === selectedCategory.name.toLowerCase()
  })

  const handleCategorySelect = (category: Category) => {
    // If selecting the same category, clear the selection
    if (selectedCategory?.id === category.id) {
      setSelectedCategory(null)
    } else {
      setSelectedCategory(category)
    }
  }

  const navToReport = () => {
    setMapState("Pin")
    navigation.jumpTo("MapTab")
  }

  const openDetails = (report) => {
    navigation.navigate("FeedDetails", {
      report,
    })
  }

  const RenderEmptyState = () => {
    if (searchQuery && filteredReports?.length === 0) {
      return (
        <View style={styles.emptyStateContainerSearch}>
          <Text style={styles.title}>No matching reports found</Text>
        </View>
      )
    }

    return (
      <View style={styles.emptyStateContainer}>
        <View>
          <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 10, textAlign: "center" }}>
            No activity yet!
          </Text>
          <Button
            preset="reversed"
            text="Make a report"
            onPress={navToReport}
            textStyle={{ color: colors.palette.neutral100, fontSize: 12 }}
            style={{
              backgroundColor: uiColors.primary,
              borderRadius: 25,
              paddingHorizontal: 25,
              paddingVertical: 10,
            }}
          />
        </View>
        <View>
          <Icon name="sad-outline" size={74} color={uiColors.primary} />
        </View>
      </View>
    )
  }

  // Load initial data with default location
  useEffect(() => {
    fetchInitialData()

    // Start location permission and fetch process in parallel
    const getLocationInBackground = async () => {
      const hasPermission = await requestLocationPermission()
      if (hasPermission) {
        await updateLocationData()
      }
    }

    getLocationInBackground()
  }, [])

  // Location status indicator - can use a Toast component here if you have one
  useEffect(() => {
    if (locationLoading) {
      // You can add toast.show({ type: 'info', message: 'Detecting your location...' })
    }
  }, [locationLoading])

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.palette.neutral800]}
          />
        }
      >
        {/* Optional location loading indicator */}
        {locationLoading && (
          <View style={styles.locationIndicator}>
            <Text style={styles.locationText}>Detecting your location...</Text>
            <ActivityIndicator size="small" color={colors.palette.primary500} />
          </View>
        )}

        <View style={styles.searchContainer}>
          <Icon
            name="search"
            size={24}
            color={isFocused ? uiColors.primary : colors.palette.neutral300}
            style={{ marginRight: 10 }}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search reports..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.palette.neutral500}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
        </View>

        <Categories onSelectCategory={handleCategorySelect} selectedCategory={selectedCategory} />

        <Text preset="formLabel" style={styles.title} text="Reports" />

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.palette.primary500} />
            <Text style={styles.loadingText}>Loading reports...</Text>
          </View>
        ) : filteredReports && filteredReports.length > 0 ? (
          <View style={styles.reportsContainer}>
            {filteredReports.map((report, index) => (
              <Pressable
                key={index}
                onPress={() => {
                  openDetails(report)
                }}
              >
                <Report key={index} report={report} />
              </Pressable>
            ))}
          </View>
        ) : (
          <RenderEmptyState />
        )}
      </ScrollView>
    </SafeAreaView>
  )
})

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.palette.neutral100,
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  searchContainer: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: colors.palette.neutral300,
    borderRadius: 25,
    borderWidth: 1,
    flexDirection: "row",
    fontSize: 13,
    marginHorizontal: 15,
    marginVertical: 10,
    paddingHorizontal: 10,
    padding: 12,
  },
  searchInput: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    color: colors.palette.neutral800,
    flex: 1,
    fontSize: 13,
  },
  title: {
    fontSize: 13,
    fontWeight: "bold",
    marginHorizontal: 15,
    marginVertical: 10,
  },
  reportsContainer: {
    // paddingHorizontal: 15,
  },
  emptyStateContainer: {
    // flex: 1,
    marginHorizontal: 15,
    alignItems: "center",
    justifyContent: "space-evenly",
    flexDirection: "row",
    borderRadius: 25,
    paddingVertical: 20,
    backgroundColor: colors.palette.neutral200,
  },
  emptyStateContainerSearch: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingVertical: 20,
  },
  activeFilterContainer: {
    alignItems: "center",
    backgroundColor: colors.palette.neutral200,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 15,
    marginVertical: 10,
    padding: 8,
  },
  activeFilterText: {
    color: colors.palette.neutral800,
    fontSize: 13,
  },
  clearFilterText: {
    color: colors.palette.primary500,
    fontSize: 13,
    marginLeft: 10,
  },
  // Add to your styles object
  locationIndicator: {
    alignItems: "center",
    backgroundColor: colors.palette.neutral100,
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
    paddingVertical: 5,
  },
  locationText: {
    color: colors.palette.neutral800,
    fontSize: 12,
    marginRight: 5,
  },
  loadingContainer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    padding: 20,
  },
  loadingText: {
    color: colors.palette.neutral600,
    fontSize: 14,
    marginLeft: 10,
  },
})
