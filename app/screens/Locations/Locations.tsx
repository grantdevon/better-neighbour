import React, { useState, useMemo } from "react"
import { observer } from "mobx-react-lite"
import { View, StyleSheet, SafeAreaView, ActivityIndicator } from "react-native"
import { Button, Screen, Text } from "app/components"
import { southAfricaSuburbs } from "app/utils/location"
import { useHeader } from "app/utils/useHeader"
import Icon from "react-native-vector-icons/Ionicons"
import { MultiSelect } from "react-native-element-dropdown"
import { debounce } from "lodash"
import { useStores } from "app/models"
import { getFormattedDate } from "app/utils/formatDate"
import { colors } from "app/theme"
import { StatusBar } from "expo-status-bar"

const RenderLeftIcon = React.memo(() => (
  <Icon style={styles.icon} color="black" name="map" size={20} />
))

export const Locations = observer(({ navigation, route }) => {
  const { coords } = route?.params

  useHeader({
    title: "Select Location's",
    leftIcon: "back",
    onLeftPress: () => navigation.navigate("Home"),
  })
  const {
    reportStore: { getReports },
    userStore: { locations, addLocation },
  } = useStores()

  const [locationsValue, setLocationsValue] = useState(locations)
  const [loading, setLoading] = useState<boolean>(false)

  const suburbs = useMemo(() => southAfricaSuburbs, [])
  const debouncedSetLocationsValue = debounce(setLocationsValue, 300)

  const saveLocations = async () => {
    setLoading(true)
    addLocation(locationsValue)
    await getReports("reports", getFormattedDate(), coords, locations)
    navigation.navigate("Home")
    setLoading(false)
  }

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size={"large"} color={colors.palette.neutral800} />
        <Text>Setting Locations...</Text>
      </SafeAreaView>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar style={"auto"} />
      <View>
        <Text
          text="Please select your location's below"
          preset="heading"
          weight="medium"
          size="xl"
          style={styles.heading}
        />

        <MultiSelect
          style={styles.dropdown}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          iconStyle={styles.iconStyle}
          search
          data={suburbs}
          labelField="label"
          valueField="value"
          placeholder="Select item"
          searchPlaceholder="Search..."
          value={locationsValue}
          onChange={(item) => {
            debouncedSetLocationsValue(item)
          }}
          renderLeftIcon={() => <RenderLeftIcon />}
          selectedStyle={styles.selectedStyle}
          flatListProps={{ initialNumToRender: 10 }}
        />
      </View>

      <Button text="Save" preset="filled" style={styles.button} onPress={saveLocations} />
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
    flex: 1,
    justifyContent: "space-between",
    paddingBottom: 20,
  },
  heading: {
    marginBottom: 15,
  },
  dropdown: {
    height: 50,
    borderColor: "gray",
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  icon: {
    marginRight: 5,
  },
  selectedStyle: {
    borderRadius: 12,
  },
  button: {
    marginTop: 50,
  },
})
