import React, { useState, useCallback, useEffect, useRef } from "react"
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator, 
  Modal 
} from "react-native"
import { observer } from "mobx-react-lite"
import Icon from "react-native-vector-icons/Ionicons"
import axios from "axios"
import { debounce } from "lodash"

import { Button, Text } from "app/components"
import { useHeader } from "app/utils/useHeader"
import { useStores } from "app/models"
import { getFormattedDate } from "app/utils/formatDate"
import { colors } from "app/theme"
import { StatusBar } from "expo-status-bar"

// Simplified Location Type to match existing implementation
interface LocationData {
  name: string;       // Display name of location
  fullAddress: string; // Full address for context
}

interface LocationSearchProps {
  onLocationSelect: (location: string) => void;
  selectedLocations: string[];
}

// Custom Location Search Component
const LocationSearch: React.FC<LocationSearchProps> = ({
  onLocationSelect, 
  selectedLocations 
}) => {
  // State Management with Strict Typing
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [locations, setLocations] = useState<LocationData[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [modalVisible, setModalVisible] = useState<boolean>(false)

  // Ref for input to manage focus
  const searchInputRef = useRef<TextInput>(null)

  // Debounced Nominatim Search with Comprehensive Error Handling
  const searchLocations = useCallback(
    debounce(async (query: string) => {
      // Validate search query
      if (!query || query.trim().length < 3) {
        setLocations([])
        return
      }
  
      setLoading(true)
      setError(null)
  
      try {
        const response = await axios.get('https://nominatim.openstreetmap.org/search', {
          params: {
            q: query,
            format: 'json',
            addressdetails: 1,
            countrycodes: 'za', // South Africa specific
            limit: 10
          },
          headers: {
            'User-Agent': 'YourAppName/1.0' 
          }
        })
  
        // More robust location formatting
        const formattedLocations: LocationData[] = response.data.map(item => {
          // Try to extract suburb or most specific location name
          const nameParts = item.display_name.split(',')
          const name = 
            item.address.suburb || 
            item.address.city_district || 
            item.address.town || 
            nameParts[0]
  
          return {
            name: name,
            fullAddress: item.display_name
          }
        })
  
        setLocations(formattedLocations)
      } catch (err) {
        const errorMessage = err instanceof Error 
          ? err.message 
          : 'Unable to fetch locations'
        
        setError(errorMessage)
        console.error('Location Search Error:', err)
      } finally {
        setLoading(false)
      }
    }, 500),
    []
  )
  // Effect to trigger search on query change
  useEffect(() => {
    if (searchQuery) {
      searchLocations(searchQuery)
    }
  }, [searchQuery, searchLocations])

  // Render Location Item in Dropdown
  const renderLocationItem = ({ item }: { item: LocationData }) => (
    <TouchableOpacity 
      style={styles.locationItem}
      onPress={() => {
        onLocationSelect(item.name)
        setSearchQuery("")
        setLocations([])
        setModalVisible(false)
      }}
    >
      <Text style={styles.locationName}>{item.name}</Text>
      <Text style={styles.locationAddress} numberOfLines={1}>
        {item.fullAddress}
      </Text>
    </TouchableOpacity>
  )

  return (
    <View style={styles.searchContainer}>
      <TouchableOpacity 
        style={styles.searchInputContainer}
        onPress={() => setModalVisible(true)}
      >
        <Icon name="search" size={20} color={colors.text} />
        <Text style={styles.searchPlaceholder}>
          {selectedLocations.length > 0 
            ? `${selectedLocations.length} suburb(s) selected` 
            : "Search locations"}
        </Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Search Input */}
            <View style={styles.modalSearchContainer}>
              <Icon name="search" size={20} color={colors.text} />
              <TextInput
                ref={searchInputRef}
                style={styles.modalSearchInput}
                placeholder="Search locations in South Africa"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="close" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Loading and Error States */}
            {loading && (
              <ActivityIndicator 
                size="large" 
                color={colors.palette.primary500} 
                style={styles.loadingIndicator} 
              />
            )}

            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}

            {/* Location Results */}
            <FlatList
              data={locations}
              renderItem={renderLocationItem}
              keyExtractor={(item) => item.name}
              style={styles.locationList}
              ListEmptyComponent={() => (
                <Text style={styles.emptyListText}>
                  {searchQuery ? "No locations found" : "Start typing to search"}
                </Text>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  )
}

export const Locations = observer(({ navigation, route }) => {
  const { coords } = route?.params

  const {
    reportStore: { getReports },
    userStore: { locations, addLocation, removeLocation },
  } = useStores()

  // State for selected locations
  const [selectedLocations, setSelectedLocations] = useState<string[]>(locations)

  // Header setup
  useHeader({
    title: "Select suburb",
    leftIcon: "back",
    onLeftPress: () => navigation.navigate("Home"),
  })

  // Location selection handler
  const handleLocationSelect = (location: string) => {
    // Prevent duplicate selections
    if (!selectedLocations.includes(location)) {
      setSelectedLocations(prev => [...prev, location])
    }
  }

  // Save locations handler
  const saveLocations = async () => {
    try {
      addLocation(selectedLocations)
      await getReports("reports", getFormattedDate(), coords, selectedLocations)
      navigation.navigate("Home")
    } catch (error) {
      console.error("Failed to save locations", error)
      // Optionally show error to user
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      <LocationSearch 
        onLocationSelect={handleLocationSelect}
        selectedLocations={selectedLocations}
      />

      {/* Selected Locations Display */}
      <View style={styles.selectedLocationsContainer}>
        {selectedLocations.map(location => (
          <View key={location} style={styles.selectedLocationChip}>
            <Text>{location}</Text>
            <TouchableOpacity 
              onPress={() => 
                setSelectedLocations(prev => 
                  prev.filter(loc => loc !== location)
                )
              }
            >
              <Icon name="close" size={25} color={colors.text} style={{paddingLeft: 5}}/>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <Button 
        text="Save Suburbs" 
        onPress={saveLocations}
        disabled={selectedLocations.length === 0}
        style={styles.saveButton}
        preset="filled"
      />
    </View>
  )
})
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: colors.background
  },
  heading: {
    marginBottom: 15
  },
  searchContainer: {
    marginBottom: 15
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8
  },
  searchPlaceholder: {
    marginLeft: 10,
    color: colors.text
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 15,
    maxHeight: '80%'
  },
  modalSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10
  },
  modalSearchInput: {
    flex: 1,
    marginHorizontal: 10
  },
  locationList: {
    maxHeight: 300
  },
  locationItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  locationName: {
    fontWeight: 'bold'
  },
  locationAddress: {
    color: colors.text
  },
  selectedLocationsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15
  },
  selectedLocationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    margin: 5
  },
  saveButton: {
    marginTop: 'auto'
  },
  loadingIndicator: {
    marginVertical: 15
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
    marginVertical: 10
  },
  emptyListText: {
    textAlign: 'center',
    color: colors.text,
    marginVertical: 20
  }
})

export default Locations