import { Alert, RefreshControl, StyleSheet, Text, TextInput, View } from "react-native"
import React, { FC, useEffect, useRef, useState } from "react"
import { observer } from "mobx-react-lite"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { AppStackParamList } from "app/navigators"
import { useHeader } from "app/utils/useHeader"
import { FlatList } from "react-native-gesture-handler"
import { useStores } from "app/models"
import { getFormattedDate } from "app/utils/formatDate"
import { Button } from "app/components"
import { colors } from "app/theme"
import LottieView from "lottie-react-native"
import { ReportCard } from "app/components/ReportCard"
import * as Location from "expo-location"
import ActionSheet, { ActionSheetRef } from "react-native-actions-sheet"
import MapView, { Heatmap, PROVIDER_GOOGLE } from "react-native-maps"

type homeProps = NativeStackScreenProps<AppStackParamList, "Home">

export const Home: FC<homeProps> = observer(({ navigation }) => {
  useHeader({
    leftText: "Today's activity",
    rightIcon: "ladybug",
    onRightPress: () => showFilterOptions(),
  })

  const {
    reportStore: { getReports, reports },
    mapStore: { setMapState },
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
      await getReports("reports", getFormattedDate(), coords)
      setLoading(false)
    } catch (error) {
      setLoading(false)
    }
  }

  const showFilterOptions = () => {
    console.log("====================================")
    console.log("show")
    console.log("====================================")
    actionSheetRef.current?.show()
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await updateHomePageData()
    setRefreshing(false)
  }

  const filteredReports = reports.filter((report) => {
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
    if (searchQuery && filteredReports.length === 0) {
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

  useEffect(() => {
    async function getCurrentLocation() {
      let { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        Alert.alert("Permission to access location was denied")
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
      <ActionSheet ref={actionSheetRef} snapPoints={[70]} containerStyle={{ height: "100%", padding:20 }}>
        <MapView
          region={{
            latitude: heatMap[0].latitude,
            longitude: heatMap[0].longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121,
          }}
          provider={PROVIDER_GOOGLE}
          minZoomLevel={15}
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
    paddingHorizontal: 10,
  },
  searchContainer: {
    marginVertical: 10,
    paddingHorizontal: 5,
  },
  searchInput: {
    backgroundColor: colors.palette.neutral100,
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
  },
  emptyStateLottieAnimation: {
    width: 320,
    height: 200,
    alignSelf: "center",
    objectFit: "contain",
  },
  emptyStateText: {
    fontWeight: "bold",
    color: colors.palette.neutral800,
    paddingLeft: 10,
    fontSize: 25,
  },
  emptyStateButton: {
    borderRadius: 7,
  },
})
