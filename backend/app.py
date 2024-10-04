from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from pymongo import MongoClient
from bson import json_util
import json

app = Flask(__name__)
CORS(app)


client = MongoClient("mongodb://localhost:27017/")
db = client['imdb_db']
movies_collection = db['movies']

# API to upload CSV and convert to JSON
@app.route('/upload_csv', methods=['POST'])
def upload_csv():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"})
    
    file = request.files['file']

    if file.filename == '':
        return jsonify({"error": "No selected file"})

    if file and file.filename.endswith('.csv'):
        
        df = pd.read_csv(file)

        
        expected_columns = [
            'budget', 'homepage', 'original_language', 'original_title', 
            'overview', 'release_date', 'revenue', 'runtime', 'status', 
            'title', 'vote_average', 'vote_count', 'production_company_id', 
            'genre_id', 'languages'
        ]
        
        
        if not all(col in df.columns for col in expected_columns):
            return jsonify({"error": "CSV columns do not match the expected structure."})
        
        
        movies_json = json.loads(df.to_json(orient='records'))
        movies_collection.insert_many(movies_json)
        
        
        
        return jsonify({"message": "CSV data uploaded successfully!"})
    
    return jsonify({"error": "Invalid file format"})


# API to get movies with pagination, filtering, and sorting
@app.route('/movies', methods=['GET'])
def get_movies():
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 10))
    sort_by = request.args.get('sort_by', 'release_date')
    sort_order = int(request.args.get('sort_order', 1))  
    filter_year = request.args.get('year')
    filter_language = request.args.get('language')
    filter_status = request.args.get('status')  

    query = {}
    if filter_year:
        query['release_date'] = {'$regex': f"^{filter_year}"}  
    if filter_language:
        query['original_language'] = filter_language
    if filter_status:  
        query['status'] = filter_status

    # MongoDB sorting and pagination
    movies = movies_collection.find(query).sort(sort_by, sort_order).skip((page - 1) * per_page).limit(per_page)
    total_movies = movies_collection.count_documents(query)

    return jsonify({
        'movies': json.loads(json_util.dumps(movies)),
        'total_movies': total_movies,
        'page': page,
        'per_page': per_page
    })

if __name__ == '__main__':
    app.run(debug=True)
