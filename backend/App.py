from flask import Flask

from routes import registerRoutes


def createApp() -> Flask:
    app = Flask(__name__)
    registerRoutes(app)
    return app
