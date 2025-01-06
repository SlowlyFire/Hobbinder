function calculateDistance(point1, point2) {
    const EARTH_RADIUS_KM = 6371;
    
    const { latitude: lat1, longitude: lon1 } = point1;
    const { latitude: lat2, longitude: lon2 } = point2;
    
    const lat1Rad = (lat1 * Math.PI) / 180;
    const lon1Rad = (lon1 * Math.PI) / 180;
    const lat2Rad = (lat2 * Math.PI) / 180;
    const lon2Rad = (lon2 * Math.PI) / 180;
    
    const deltaLat = lat2Rad - lat1Rad;
    const deltaLon = lon2Rad - lon1Rad;
    
    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
             Math.cos(lat1Rad) * Math.cos(lat2Rad) *
             Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
             
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(EARTH_RADIUS_KM * c * 100) / 100;
}

export default { calculateDistance }