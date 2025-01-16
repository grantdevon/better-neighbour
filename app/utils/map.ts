interface NominatimResponse {
  address: {
    suburb?: string
    city_district?: string
    county?: string
    town?: string
  }
}

const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Radius of Earth in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
};

export const fetchLocationFromCoords = async (lat: number, lng: number): Promise<string | null> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
    )
    if (!response.ok) {
      throw new Error("Nominatim API request failed")
    }
    const data: NominatimResponse = await response.json()
    const location =
      data.address.county ||
      data.address.town ||
      data.address.suburb ||
      data.address.city_district

    if (location) {
      return location
    }

    return null
  } catch (error) {
    console.error("Error fetching location:", error)
    return null
  }
}
