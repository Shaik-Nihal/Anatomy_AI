import json
from pathlib import Path

DATA_PATH = Path(__file__).resolve().parent.parent / 'data' / 'anatomy.json'

def load_topic_data():
    if not DATA_PATH.exists():
        return {}

    with open(DATA_PATH, 'r', encoding='utf-8') as handle:
        return json.load(handle)

def find_summary(topic: str) -> str:
    data = load_topic_data()
    for entry in data.get('topics', []):
        if entry.get('title', '').lower() == topic.lower():
            return entry.get('summary', '')
    return ''
