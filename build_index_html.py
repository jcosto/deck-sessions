index_path = r"templates\index-azurewebpubsub.html"
with open(index_path,"r") as fin:
    index_html = fin.read()

file_replace_items = [
    {
        "src_path": r"static\assets\card.css",
        "src_target": """<link rel="stylesheet" href="{{url_for('static', filename='assets/card.css')}}" />""",
        "dst_text": "<style>{file_content}</style>"
    },
    {
        "src_path": r"static\main_pubsub.js",
        "src_target": """<script src="{{url_for('static', filename='main_pubsub.js')}}"></script>""",
        "dst_text": "<script>{file_content}</script>"
    },
    {
        "src_path": r"static\card_pubsub.js",
        "src_target": """<script src="{{url_for('static', filename='card_pubsub.js')}}"></script>""",
        "dst_text": "<script>{file_content}</script>"
    },
    {
        "src_path": r"static\card_deck_pubsub.js",
        "src_target": """<script src="{{url_for('static', filename='card_deck_pubsub.js')}}"></script>""",
        "dst_text": "<script>{file_content}</script>"
    },
    {
        "src_path": r"static\card_table_pubsub.js",
        "src_target": """<script src="{{url_for('static', filename='card_table_pubsub.js')}}"></script>""",
        "dst_text": "<script>{file_content}</script>"
    },
    {
        "src_path": r"static\card_session_pubsub.js",
        "src_target": """<script src="{{url_for('static', filename='card_session_pubsub.js')}}"></script>""",
        "dst_text": "<script>{file_content}</script>"
    },
]
for fri in file_replace_items:
    src_path = fri["src_path"]
    src_target = fri["src_target"]
    dst_text = fri["dst_text"]
    with open(src_path, 'r') as fin:
        index_html = index_html.replace(
            src_target, dst_text.replace("{file_content}", fin.read())
        )

with open("index.html", "w") as fout:
    fout.write(index_html)