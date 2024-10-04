import React, { useState } from "react";

import MovieList from "./components/MovieList";

function App() {
  const [refreshMovies, setRefreshMovies] = useState(false);

  const handleUploadSuccess = () => {
    // Trigger refreshMovies state change to force re-fetch of movies
    setRefreshMovies(!refreshMovies);
  };

  return (
    <div>
      <MovieList />
    </div>
  );
}

export default App;
