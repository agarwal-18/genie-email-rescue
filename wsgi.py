
from app import app

# This is for local development
if __name__ == "__main__":
    app.run(debug=True)

# This is for Vercel serverless deployment
def handler(event, context):
    return app(event, context)
