from dotenv import load_dotenv
load_dotenv(".env")

import os

if __name__ == "__main__":
    if os.environ["MODE"] == "dev" and os.environ["DEPLOYMENT_LOCATION"] == "local":
        print(
            "MODE '%s' and DEPLOYMENT_LOCATION '%s' set, running flask-socketio implementation" %
            (os.environ["MODE"], os.environ["DEPLOYMENT_LOCATION"])
        )
        from app import run
        run()
    elif os.environ["MODE"] == "dev" and os.environ["DEPLOYMENT_LOCATION"] == "azure_webpubsub_emulate":
        raise RuntimeError(
            "MODE '%s' and DEPLOYMENT_LOCATION '%s' not handled" %
            (os.environ["MODE"], os.environ["DEPLOYMENT_LOCATION"])
        )
    elif os.environ["MODE"] == "prod" and os.environ["DEPLOYMENT_LOCATION"] == "azurefunction":
        raise RuntimeError(
            "MODE '%s' and DEPLOYMENT_LOCATION '%s' not handled" %
            (os.environ["MODE"], os.environ["DEPLOYMENT_LOCATION"])
        )
    else:
        raise RuntimeError(
            "MODE '%s' and DEPLOYMENT_LOCATION '%s' not supported" %
            (os.environ["MODE"], os.environ["DEPLOYMENT_LOCATION"])
        )