import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
from groq import Groq

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__, static_folder='../frontend', static_url_path='')
CORS(app)  # Enable CORS for all routes

# Initialize Groq client
groq_api_key = os.getenv("GROQ_API_KEY")
if not groq_api_key:
    raise ValueError("GROQ_API_KEY not found in environment variables.")
client = Groq(api_key=groq_api_key)

# Serve static files from the frontend
@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/css/<path:filename>')
def serve_css(filename):
    return send_from_directory(os.path.join(app.static_folder, 'css'), filename)

@app.route('/js/<path:filename>')
def serve_js(filename):
    return send_from_directory(os.path.join(app.static_folder, 'js'), filename)

@app.route('/favicon.ico')
def serve_favicon():
    return send_from_directory(app.static_folder, 'favicon.ico')

@app.route('/api/time', methods=['GET'])
def get_current_time():
    import datetime
    return jsonify({'time': datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')})

@app.route('/convert', methods=['POST'])
def convert_text():
    data = request.json
    text_to_convert = data.get('text', '')
    target_audience = data.get('targetAudience', 'colleague')

    system_prompts = {
        "boss": "You are a professional assistant. Convert the given text into a formal and respectful tone, suitable for reporting to a superior. Focus on clarity, conciseness, and presenting conclusions first. Use honorifics and a business-like vocabulary.",
        "colleague": "You are a professional assistant. Convert the given text into a polite and cooperative tone, suitable for communication with a colleague. Emphasize mutual respect, clear requests, and specific deadlines if applicable.",
        "client": "You are a professional assistant. Convert the given text into an extremely polite and customer-oriented tone, suitable for communication with a client. Focus on building trust, professionalism, and service-minded language. Use honorifics and provide information clearly and reassuringly.",
        "default": "You are a helpful assistant that converts text into a professional tone suitable for the specified target audience. Maintain the original meaning."
    }
    
    selected_system_prompt = system_prompts.get(target_audience, system_prompts["default"])

    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": selected_system_prompt,
                },
                {
                    "role": "user",
                    "content": f"Convert the following text:\n\n{text_to_convert}",
                }
            ],
            model="llama3-8b-8192", # Using a common Groq model, this can be refined in Task 3
            temperature=0.7,
            max_tokens=1024,
            top_p=1,
            stop=None,
            stream=False
        )
        converted_text = chat_completion.choices[0].message.content
        return jsonify({'convertedText': converted_text})
    except Exception as e:
        app.logger.error(f"Error during Groq API call: {e}")
        return jsonify({'error': 'Failed to convert text. Please try again later.'}), 500

if __name__ == '__main__':
    app.run(debug=True)
