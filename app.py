from flask import Flask, request as flask_request, jsonify, render_template
from flask_cors import CORS
import requests

# Initialize Flask app
app = Flask(__name__)

# Enable CORS (Cross-Origin Resource Sharing)
CORS(app)

@app.route('/')
def index():
    """
    Serve the main frontend UI (index.html from the templates folder).
    """
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate_code():
    """
    Endpoint to generate code based on a prompt and language.
    """
    data = flask_request.json
    user_input = data.get('prompt', '')
    language = data.get('language', 'Python')
    
    if not user_input:
        return jsonify({"error": "Prompt cannot be empty"}), 400
        
    prompt_message = (
        f"You are a senior full-stack developer and an AI Coding Assistant.\n"
        f"Generate clean, well-commented {language} code for the following problem:\n"
        f"{user_input}\n\n"
        f"Also explain the code in simple, beginner-friendly terms. Format politely."
    )
        
    try:
        # Call 100% free Pollinations AI service, ZERO API KEYS REQUIRED
        response = requests.post(
            'https://text.pollinations.ai/',
            json={'messages': [{'role': 'user', 'content': prompt_message}], 'model': 'openai'}
        )
        
        # The result is returned directly as raw text from the URL
        if response.status_code == 200:
            return jsonify({"result": response.text})
        else:
            return jsonify({"error": "AI service temporarily unavailable"}), 500
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/debug', methods=['POST'])
def debug_code():
    """
    Endpoint to debug provided code and explain errors.
    """
    data = flask_request.json
    user_code = data.get('code', '')
    
    if not user_code:
        return jsonify({"error": "Code cannot be empty"}), 400
        
    prompt_message = (
        f"You are an expert debugger and programming mentor.\n"
        f"Find errors in the following code, fix them, and explain the mistakes clearly:\n\n"
        f"{user_code}"
    )
        
    try:
        response = requests.post(
            'https://text.pollinations.ai/',
            json={'messages': [{'role': 'user', 'content': prompt_message}], 'model': 'openai'}
        )
        
        if response.status_code == 200:
            return jsonify({"result": response.text})
        else:
            return jsonify({"error": "AI service temporarily unavailable"}), 500
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Run the Flask server locally
    app.run(debug=True, port=5000)
