# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise ValueError("No OpenAI API key found. Please check your .env file.")

client = OpenAI(api_key=api_key)
print(api_key)


@app.route('/generate-mandala', methods=['POST'])
def generate_mandala():
    try:
        data = request.json
        center_topic = data.get('centerTopic')

        if not center_topic:
            raise ValueError("Center topic is required")

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "マンダラチャートのために、トピックを達成するための手段や方法を８つ作成する"},
                {"role": "user", "content": f"'{center_topic}'を達成するための８つの手段や方法を作成してください. 簡潔にお願いします."}
            ]
        )

        subtopics = response.choices[0].message.content.strip().split('\n')
        return jsonify({"subtopics": subtopics[:8]})
    except Exception as e:
        raise e


if __name__ == '__main__':
    app.run(debug=True)
