
from flask import Flask, request, jsonify, send_from_directory
from urllib.request import urlopen
from urllib.parse import urlencode
import json

app = Flask(__name__, static_folder=".", static_url_path="")


@app.route("/")
def home():
    return send_from_directory(".", "index.html")


@app.route("/translate", methods=["POST"])
def translate():
    data = request.get_json(silent=True) or {}

    text = data.get("text", "").strip()
    source = data.get("source", "en")
    target = data.get("target", "ta")

    if not text:
        return jsonify({"error": "Please enter some text."}), 400

    if len(text) > 1000:
        return jsonify({"error": "Text is too long."}), 400

    if source == "auto":
        return jsonify({
            "error": "Please select the source language instead of Detect Language."
        }), 400

    try:
        params = urlencode({
            "q": text,
            "langpair": f"{source}|{target}"
        })

        url = "https://api.mymemory.translated.net/get?" + params

        with urlopen(url, timeout=20) as response:
            result = json.loads(response.read().decode("utf-8"))

        if result.get("responseStatus") != 200:
            return jsonify({
                "error": "Translation service is temporarily unavailable."
            }), 502

        translated = result["responseData"]["translatedText"]

        return jsonify({"translation": translated})

    except Exception as error:
        print("TRANSLATION ERROR:", error)
        return jsonify({
            "error": "Could not translate. Check your internet connection."
        }), 500


if __name__ == "__main__":
    app.run(debug=True)
