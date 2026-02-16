import {
  Alert,
  Linking,
  RefreshControl,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native"
import React, { FC, useEffect, useRef, useState } from "react"
import { observer } from "mobx-react-lite"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { AppStackParamList } from "app/navigators"
import { useHeader } from "app/utils/useHeader"
import { useStores } from "app/models"
import { getFormattedDate } from "app/utils/formatDate"
import { Button, Text as TX, ListView } from "app/components"
import { colors } from "app/theme"
import LottieView from "lottie-react-native"
import { ReportCard } from "app/components/ReportCard"
import * as Location from "expo-location"
import ActionSheet, { ActionSheetRef } from "react-native-actions-sheet"
import MapView, { Heatmap, PROVIDER_GOOGLE } from "react-native-maps"
import { fetchLocationFromCoords } from "app/utils/map"

interface NominatimResponse {
  address: {
    suburb?: string
    city_district?: string
    county?: string
    town?: string
  }
}

type homeProps = NativeStackScreenProps<AppStackParamList, "HomeTab">

export const Home: FC<homeProps> = observer(({ navigation }) => {
  useHeader({
    leftText: "Today's activity",
    rightIcon: "ladybug",
    backgroundColor: colors.palette.neutral100,
    onRightPress: () => showFilterOptions(),
  })

  const {
    reportStore: { getProvinceReports, reports },
    mapStore: { setMapState },
    userStore: { removeLocation },
  } = useStores()

  console.log(JSON.stringify(reports));
  

  const actionSheetRef = useRef<ActionSheetRef>(null)

  const [loading, setLoading] = useState<boolean>(true)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [location, setLocation] = useState<Location.LocationObject | null>({
    coords: { latitude: 0, longitude: 0 },
  })
  const [heatMap, setHeatMap] = useState<any>([
    {
      latitude: location?.coords.latitude,
      longitude: location?.coords.longitude,
      weight: 10,
      text: "string",
    },
  ])
  const [locationPermission, setLocationPermission] = useState<boolean>(true)

  const updateHomePageData = async () => {
    try {
      const coords = { lat: location?.coords.latitude, lng: location?.coords.longitude }
      const newLocation = await Location.getCurrentPositionAsync({})
      setLocation(newLocation)
      const province = await fetchLocationFromCoords(
        newLocation.coords.latitude,
        newLocation.coords.longitude,
      )
      console.log("====================================")
      console.log(province)
      console.log("====================================")
      await getProvinceReports("reports", getFormattedDate(), coords, province)
      setLoading(false)
    } catch (error) {
      setLoading(false)
    }
  }

  const showFilterOptions = () => {
    actionSheetRef.current?.show()
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await updateHomePageData()
    setRefreshing(false)
  }

  const filteredReports = reports?.filter((report) => {
    const searchLower = searchQuery.toLowerCase()
    return (
      report.name.toLowerCase().includes(searchLower) ||
      report.location.toLowerCase().includes(searchLower) ||
      report.description.toLowerCase().includes(searchLower) ||
      report.reportType.toLowerCase().includes(searchLower)
    )
  })

  const ShareCard = () => {
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
      <View style={styles.shareCard}>
        <Text style={styles.shareCardText}>Enjoying the app? Invite your friends to join!</Text>
        <Button preset="filled" text="Share Now" onPress={handleShare} style={styles.shareButton} />
      </View>
    )
  }

  const RenderCards = ({ item }) => {
    return (
      <ReportCard item={item} onPress={() => handleActionSheet(item.coords.lat, item.coords.lng)} />
    )
  }

  const RenderEmptyState = () => {
    if (searchQuery && filteredReports?.length === 0) {
      return (
        <View style={styles.EmptyStateCard}>
          <Text style={styles.emptyStateText}>No matching reports found</Text>
        </View>
      )
    }

    return (
      <View>
        <ShareCard />
        <View style={styles.EmptyStateCard}>
          <Text style={styles.emptyStateText}>No activity so far!</Text>
          <LottieView
            source={require("../../../assets/animations/aura.json")}
            style={styles.emptyStateLottieAnimation}
            autoPlay
            loop
          />
          <Button
            preset="filled"
            text="Make a report"
            onPress={navToReport}
            style={styles.emptyStateButton}
          />
        </View>
      </View>
    )
  }

  const navToReport = () => {
    setMapState("Pin")
    navigation.jumpTo("MapTab")
  }

  const handleActionSheet = (lat, lng) => {
    setHeatMap([
      {
        latitude: lat,
        longitude: lng,
        weight: 10,
      },
    ])
    actionSheetRef.current?.show()
    // show action sheet of heat map
  }

  const handleRemoveLocation = async (locationToRemove) => {
    onRefresh()
    removeLocation(locationToRemove)
  }

  const confirmSettings = () => {
    Alert.alert("Alert!", "Please restart your app after granting access.", [
      {
        text: "I understand",
        onPress: () => Linking.openSettings(),
      },
    ])
  }

  useEffect(() => {
    async function getCurrentLocation() {
      const { status } = await Location.requestForegroundPermissionsAsync()
      console.log(status)

      if (status !== "granted") {
        Alert.alert(
          "Alert!",
          "Permission to access location was denied, please allow location permission.",
        )
        setLocationPermission(false)
        return
      }

      const location = await Location.getCurrentPositionAsync({})
      setLocation(location)
    }

    getCurrentLocation()
  }, [])

  useEffect(() => {
    setLoading(true)
    updateHomePageData()
    setLoading(false)
  }, [])

  if (!locationPermission) {
    return (
      <View style={styles.noPermissioncontainer}>
        <TX
          preset="heading"
          text="Please make sure location permission has been granted"
          size="lg"
          weight="medium"
        />
        <Button
          preset="filled"
          text="Allow"
          onPress={confirmSettings}
          style={styles.noPermissionButton}
        />
      </View>
    )
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <LottieView
          source={require("../../../assets/animations/loading.json")}
          autoPlay
          loop
          style={styles.loadingAnimation}
        />
        <Text style={styles.loadingText}>Fetching Today's Activity For You...</Text>
      </View>
    )
  }

  // if (locations.length === 0) {
  //   return (
  //     <View style={styles.container}>
  //       <View style={styles.EmptyStateCard}>
  //         <Text style={styles.emptyStateText}>No suburbs set, please set a suburb!</Text>
  //         <LottieView
  //           source={require("../../../assets/animations/aura.json")}
  //           style={styles.emptyStateLottieAnimation}
  //           autoPlay
  //           loop
  //         />
  //         <Button
  //           preset="filled"
  //           text="Set a suburb"
  //           onPress={() =>
  //             navigation.navigate("Locations", {
  //               coords: { lat: location?.coords.latitude, lng: location?.coords.longitude },
  //             })
  //           }
  //           style={styles.emptyStateButton}
  //         />
  //       </View>
  //     </View>
  //   )
  // }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search reports..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.palette.neutral500}
        />
      </View>
      <ListView
        data={filteredReports}
        renderItem={RenderCards}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.palette.neutral800]}
          />
        }
        estimatedItemSize={200}
        ListEmptyComponent={RenderEmptyState}
      />
      <ActionSheet
        ref={actionSheetRef}
        snapPoints={[50]}
        containerStyle={{ height: "100%", padding: 20 }}
      >
        <TX text="Activity location" preset="heading" size="xl" style={{ paddingBottom: 10 }} />
        <MapView
          region={{
            latitude: heatMap[0].latitude,
            longitude: heatMap[0].longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121,
          }}
          provider={PROVIDER_GOOGLE}
          maxZoomLevel={17}
          style={styles.map}
        >
          <Heatmap
            points={heatMap}
            opacity={0.8}
            radius={50}
            gradient={{
              colors: ["#EEC20B", "#F29305", "#E50000"],
              startPoints: [0.5, 0.75, 1],
              colorMapSize: 100,
            }}
          />
        </MapView>
      </ActionSheet>
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.palette.neutral100,
    flex: 1,
  },
  searchContainer: {
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  searchInput: {
    backgroundColor: colors.palette.neutral200,
    borderRadius: 10,
    color: colors.palette.neutral800,
    fontSize: 16,
    padding: 12,
  },
  headerContainer: {
    marginVertical: 20,
  },
  headerText: {
    color: colors.palette.neutral800,
    fontSize: 17,
    fontWeight: "700",
  },
  cardContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    elevation: 3,
    marginVertical: 5,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  nameText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  locationText: {
    color: "#555",
    fontSize: 14,
    marginBottom: 5,
  },
  descriptionText: {
    color: "#777",
    fontSize: 14,
    marginBottom: 10,
  },
  map: {
    borderRadius: 10,
    height: 250,
  },
  noPermissionButton: {
    marginTop: 20,
    width: "100%",
  },
  button: {
    alignSelf: "center",
    backgroundColor: "#0044cc",
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  loadingAnimation: {
    alignSelf: "center",
    height: 250,
    width: 250,
  },
  loadingText: {
    color: colors.palette.neutral800,
    flexWrap: "wrap",
    fontSize: 25,
    fontWeight: "bold",
    textAlign: "center",
  },
  EmptyStateCard: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    elevation: 3,
    marginHorizontal: 15,
    marginVertical: 20,
    paddingHorizontal: 10,
    paddingVertical: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  emptyStateLottieAnimation: {
    alignSelf: "center",
    height: 200,
    objectFit: "contain",
    width: 320,
  },
  emptyStateText: {
    color: colors.palette.neutral700,
    fontSize: 20,
    fontWeight: "bold",
    paddingLeft: 10,
  },
  emptyStateButton: {
    borderRadius: 7,
  },
  locationContainer: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  noLocationsText: {
    color: colors.palette.neutral500,
    fontSize: 16,
  },
  chip: {
    backgroundColor: colors.palette.primary500,
    borderRadius: 20,
    marginRight: 5,
    padding: 10,
  },
  chipText: {
    color: "white",
    fontSize: 14,
  },
  chipWrapper: {
    paddingHorizontal: 5,
    paddingTop: 10,
  },
  chipContainer: {
    marginHorizontal: 2,
  },
  // chip: {
  //   backgroundColor: colors.palette.primary500,
  //   flexDirection: "row",
  // },
  // chipText: {
  //   color: "white",
  //   fontSize: 14,
  // },
  noPermissioncontainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  plusChipContainer: {
    marginHorizontal: 2,
  },
  plusChip: {
    backgroundColor: colors.palette.neutral100,
    borderColor: colors.palette.neutral500,
    borderWidth: 1,
  },
  plusChipText: {
    color: colors.palette.neutral800,
  },

  shareCard: {
    alignItems: "center",
    backgroundColor: colors.palette.neutral100,
    borderRadius: 10,
    elevation: 3,
    margin: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  shareCardText: {
    color: colors.palette.neutral700,
    fontSize: 16,
    marginBottom: 10,
    textAlign: "center",
  },
  shareButton: {
    backgroundColor: colors.palette.secondary100,
    width: "100%",
  },
  cardShareButton: {
    backgroundColor: colors.palette.secondary100,
    borderRadius: 7,
    marginBottom: 15,
    marginHorizontal: 15,
    marginTop: 10,
  },
})
