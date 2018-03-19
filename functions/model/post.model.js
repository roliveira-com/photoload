exports.Novo = function(id, title, location, rawLat, rawLon, image){
  return {
    id: id,
    title: title,
    location: location,
    rawLocation: {
      lat: rawLat,
      lon: rawLon
    },
    picture: image
  }
}