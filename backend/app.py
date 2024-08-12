# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
import os


def load_env_variables():
    # ローカル環境の .env ファイルがある場合はそれを読み込む
    if os.path.exists('.env'):
        from dotenv import load_dotenv
        load_dotenv()

    # 環境変数を取得
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise ValueError(
            "OPENAI_API_KEY is not set in the environment variables.")
    return api_key


app = Flask(__name__)
CORS(app)

# 環境変数を読み込む
api_key = load_env_variables()
client = OpenAI(api_key=api_key)


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
