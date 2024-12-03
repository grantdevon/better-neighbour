import { Alert, RefreshControl, StyleSheet, Text, TextInput, View } from "react-native"
import React, { FC, useEffect, useRef, useState } from "react"
import { observer } from "mobx-react-lite"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { AppStackParamList } from "app/navigators"
import { useHeader } from "app/utils/useHeader"
import { FlatList } from "react-native-gesture-handler"
import { useStores } from "app/models"
import { getFormattedDate } from "app/utils/formatDate"
import { Button, Text as TX } from "app/components"
import { colors } from "app/theme"
import LottieView from "lottie-react-native"
import { ReportCard } from "app/components/ReportCard"
import * as Location from "expo-location"
import ActionSheet, { ActionSheetRef } from "react-native-actions-sheet"
import MapView, { Heatmap, PROVIDER_GOOGLE } from "react-native-maps"
import { Chip } from "@rneui/base"

type homeProps = NativeStackScreenProps<AppStackParamList, "HomeTab">

export const Home: FC<homeProps> = observer(({ navigation }) => {
  useHeader({
    leftText: "Today's activity",
    rightIcon: "ladybug",
    backgroundColor: colors.palette.neutral100,
    onRightPress: () => showFilterOptions(),
  })

  const {
    reportStore: { getReports, reports },
    mapStore: { setMapState },
    userStore: { locations, removeLocation },
  } = useStores()

  const actionSheetRef = useRef<ActionSheetRef>(null)

  const [loading, setLoading] = useState<boolean>(true)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [location, setLocation] = useState<Location.LocationObject | null>(null)
  const [heatMap, setHeatMap] = useState<any>([
    {
      latitude: location?.coords.latitude,
      longitude: location?.coords.longitude,
      weight: 10,
      text: "string",
    },
  ])

  const updateHomePageData = async () => {
    try {
      let coords = { lat: location?.coords.latitude, lng: location?.coords.longitude }
      if (locations.length > 0) {
        await getReports("reports", getFormattedDate(), coords, locations)
      }
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

  useEffect(() => {
    async function getCurrentLocation() {
      let { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        Alert.alert("Permission to access location was denied, please allow location permission.")
        return
      }

      let location = await Location.getCurrentPositionAsync({})
      setLocation(location)
    }

    getCurrentLocation()
  }, [])

  useEffect(() => {
    setLoading(true)
    updateHomePageData()
    setLoading(false)
  }, [])

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

  if (locations.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.EmptyStateCard}>
          <Text style={styles.emptyStateText}>No locations set, please set a location!</Text>
          <LottieView
            source={require("../../../assets/animations/aura.json")}
            style={styles.emptyStateLottieAnimation}
            autoPlay
            loop
          />
          <Button
            preset="filled"
            text="Set a location"
            onPress={() =>
              navigation.navigate("Locations", {
                coords: { lat: location?.coords.latitude, lng: location?.coords.longitude },
              })
            }
            style={styles.emptyStateButton}
          />
        </View>
      </View>
    )
  }

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
      <View style={styles.locationContainer}>
        <FlatList
          data={["+", ...locations]}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.chipWrapper}>
              {item === "+" ? (
                <Chip
                  title="+"
                  onPress={() =>
                    navigation.navigate("Locations", {
                      coords: { lat: location?.coords.latitude, lng: location?.coords.longitude },
                    })
                  }
                  containerStyle={styles.plusChipContainer}
                  buttonStyle={styles.plusChip}
                  titleStyle={styles.plusChipText}
                />
              ) : (
                <Chip
                  title={item}
                  icon={{
                    name: "close",
                    type: "material",
                    color: "white",
                    size: 18,
                    onPress: () => handleRemoveLocation(item),
                  }}
                  containerStyle={styles.chipContainer}
                  buttonStyle={styles.chip}
                  titleStyle={styles.chipText}
                />
              )}
            </View>
          )}
        />
      </View>
      <FlatList
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
    flex: 1,
    backgroundColor: colors.palette.neutral100,
  },
  searchContainer: {
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  searchInput: {
    backgroundColor: colors.palette.neutral200,
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
    color: colors.palette.neutral800,
  },
  headerContainer: {
    marginVertical: 20,
  },
  headerText: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.palette.neutral800,
  },
  cardContainer: {
    marginVertical: 5,
    padding: 15,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  nameText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  locationText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
  },
  descriptionText: {
    fontSize: 14,
    color: "#777",
    marginBottom: 10,
  },
  map: {
    height: 250,
    borderRadius: 10,
  },
  button: {
    alignSelf: "center",
    backgroundColor: "#0044cc",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  loadingAnimation: {
    width: 250,
    height: 250,
    alignSelf: "center",
  },
  loadingText: {
    fontWeight: "bold",
    fontSize: 25,
    color: colors.palette.neutral800,
    textAlign: "center",
    flexWrap: "wrap",
  },
  EmptyStateCard: {
    paddingHorizontal: 10,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    paddingVertical: 20,
    marginVertical: 20,
    marginHorizontal: 15,
  },
  emptyStateLottieAnimation: {
    width: 320,
    height: 200,
    alignSelf: "center",
    objectFit: "contain",
  },
  emptyStateText: {
    fontWeight: "bold",
    color: colors.palette.neutral700,
    paddingLeft: 10,
    fontSize: 20,
  },
  emptyStateButton: {
    borderRadius: 7,
  },
  locationContainer: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: "row",
  },
  noLocationsText: {
    color: colors.palette.neutral500,
    fontSize: 16,
  },
  chip: {
    marginRight: 5,
    backgroundColor: colors.palette.primary500,
    padding: 10,
    borderRadius: 20,
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
  chip: {
    backgroundColor: colors.palette.primary500,
    flexDirection: "row",
  },
  chipText: {
    color: "white",
    fontSize: 14,
  },
  plusChipContainer: {
    marginHorizontal: 2,
  },
  plusChip: {
    backgroundColor: colors.palette.neutral100,
    borderWidth: 1,
    borderColor: colors.palette.neutral500,
  },
  plusChipText: {
    color: colors.palette.neutral800,
  },
})
