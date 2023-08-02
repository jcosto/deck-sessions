index_path = r"templates\index-azurewebpubsub.html"
css_path = r"static\assets\card.css"
main_js_path = r"static\main_pubsub.js"
deck_js_path = r"static\components\deck_pubsub.js"
card_js_path = r"static\components\card_pubsub.js"

with open(index_path,"r") as fin:
    index_html = fin.read()
with open(css_path, "r") as fin:
    index_html = index_html.replace(
        """<link rel="stylesheet" href="{{url_for('static', filename='assets/card.css')}}" />""",
        "<style>"+fin.read()+"</style>"
    )
with open(main_js_path, "r") as fin:
    index_html = index_html.replace(
        """<script src="{{url_for('static', filename='main_pubsub.js')}}"></script>""",
        "<script>"+fin.read()+"</script>"
    )
with open(deck_js_path, "r") as fin:
    index_html = index_html.replace(
        """<script src="{{url_for('static', filename='components/deck_pubsub.js')}}"></script>""",
        "<script>"+fin.read()+"</script>"
    )
with open(card_js_path, "r") as fin:
    index_html = index_html.replace(
        """<script src="{{url_for('static', filename='components/card_pubsub.js')}}"></script>""",
        "<script>"+fin.read()+"</script>"
    )

with open("index.html", "w") as fout:
    fout.write(index_html)