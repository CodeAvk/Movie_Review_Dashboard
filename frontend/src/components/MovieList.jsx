import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import toastr from "toastr";

const MovieList = ({ refreshMovies }) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalMovies, setTotalMovies] = useState(0);
  const [year, setYear] = useState("");
  const [language, setLanguage] = useState("");
  const [status, setStatus] = useState("");
  const [file, setFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [sortBy, setSortBy] = useState("release_date");
  const [sortOrder, setSortOrder] = useState(1);

  useEffect(() => {
    fetchMovies();
  }, [page, perPage, year, language, status, sortBy, sortOrder, refreshMovies]);

  const fetchMovies = async () => {
    setLoading(true);
    let query = `page=${page}&per_page=${perPage}&sort_by=${sortBy}&sort_order=${sortOrder}`;
    if (year) query += `&year=${year}`;
    if (language) query += `&language=${language}`;
    if (status) query += `&status=${status}`;

    try {
      const response = await fetch(`http://localhost:5000/movies?${query}`);
      const data = await response.json();
      setMovies(data.movies);
      setTotalMovies(data.total_movies);
    } catch (error) {
      console.error("Error fetching movies:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:5000/upload_csv", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      toastr.success(data.message || data.error); // Show Toastr notification
      setUploadMessage(data.message || data.error);

      if (data.message) {
        fetchMovies();
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toastr.error("An error occurred while uploading the file."); // Show Toastr error
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 1 ? -1 : 1);
    } else {
      setSortBy(field);
      setSortOrder(1);
    }
  };

  // Calculate total pages
  const totalPages = Math.ceil(totalMovies / perPage);

  return (
    <div className="min-vh-100 bg-dark text-white p-4">
      <style jsx>{`
        .custom-input {
          background-color: rgba(126, 34, 206, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .custom-button {
          background-color: rgba(126, 34, 206, 0.6);
          transition: background-color 0.3s ease;
        }
        .custom-button:hover {
          background-color: rgba(126, 34, 206, 0.8);
        }
        .loader {
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top: 4px solid #fff;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        .table-container {
          overflow-x: auto;
          max-width: 100%;
        }
        .movie-table {
          min-width: 1500px;
        }
        .sortable {
          cursor: pointer;
        }
        .sortable:hover {
          text-decoration: underline;
        }
      `}</style>

      <h1 className="text-center display-4 text-light mb-4">Movie Database</h1>

      {/* Combined Upload CSV and Filter Section */}
      <div className="mb-4 p-4 bg-secondary bg-opacity-75 rounded">
        <div className="row mb-4">
          <div className="col-md">
            <h2 className="mb-3">Upload CSV File</h2>
            <input
              type="file"
              onChange={handleFileChange}
              className="form-control custom-input mb-3"
            />
            <button onClick={handleUpload} className="btn custom-button w-100">
              Upload
            </button>
            {uploadMessage && (
              <p className="text-light mt-2">{uploadMessage}</p>
            )}
          </div>
        </div>

        {/* Input fields for filtering movies */}
        <div className="row g-2 mb-3">
          <div className="col-md">
            <input
              placeholder="Filter by Year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="form-control custom-input"
            />
          </div>
          <div className="col-md">
            <input
              placeholder="Filter by Language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="form-control custom-input"
            />
          </div>
          <div className="col-md">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="form-control custom-input"
            >
              <option value="">Filter by Status</option>
              <option value="Released">Released</option>
              <option value="Planned">Planned</option>
            </select>
          </div>
        </div>
      </div>

      {/* Movie Table */}
      {loading ? (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: "200px" }}
        >
          <div className="loader"></div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-dark table-striped table-hover">
            <thead>
              <tr>
                <th>Sl No</th>
                <th>Title</th>
                <th
                  className="sortable"
                  onClick={() => handleSort("release_date")}
                >
                  Release Date{" "}
                  {sortBy === "release_date" && (sortOrder === 1 ? "▲" : "▼")}
                </th>
                <th>Language</th>
                <th>Budget</th>
                <th>Revenue</th>
                <th>Runtime</th>
                <th
                  className="sortable"
                  onClick={() => handleSort("vote_average")}
                >
                  Vote Average{" "}
                  {sortBy === "vote_average" && (sortOrder === 1 ? "▲" : "▼")}
                </th>
                <th>Vote Count</th>
                <th>Status</th>
                <th>Overview</th>
                <th>Homepage</th>
              </tr>
            </thead>
            <tbody>
              {movies.map((movie, index) => (
                <tr key={movie._id}>
                  <td>{index + 1 + (page - 1) * perPage}</td>
                  <td>{movie.title}</td>
                  <td>{movie.release_date}</td>
                  <td>{movie.original_language}</td>
                  <td>${movie.budget?.toLocaleString()}</td>
                  <td>${movie.revenue?.toLocaleString()}</td>
                  <td>{movie.runtime} min</td>
                  <td>{movie.vote_average}</td>
                  <td>{movie.vote_count}</td>
                  <td>{movie.status}</td>
                  <td>{movie.overview}</td>
                  <td>{movie.homepage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <nav aria-label="Page navigation">
        <ul className="pagination justify-content-center mt-4">
          <li className="page-item">
            <button
              className="page-link"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
            >
              Previous
            </button>
          </li>
          <li className="page-item">
            <button
              className="page-link"
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
            >
              Next
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default MovieList;
