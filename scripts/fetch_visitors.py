import os
from google.oauth2 import service_account
from googleapiclient.discovery import build
import json

# Replace with your Google Analytics view ID
VIEW_ID = 'YOUR_VIEW_ID'

# Path to your service account key file
KEY_FILE_LOCATION = 'path/to/your-service-account-file.json'

# Authenticate and construct service
credentials = service_account.Credentials.from_service_account_info(
    json.loads(os.environ['GOOGLE_SECRET']),
    scopes=['https://www.googleapis.com/auth/analytics.readonly']
)

analytics = build('analyticsreporting', 'v4', credentials=credentials)

def get_visitor_count():
    response = analytics.reports().batchGet(
        body={
            'reportRequests': [
                {
                    'viewId': VIEW_ID,
                    'dateRanges': [{'startDate': '30daysAgo', 'endDate': 'today'}],
                    'metrics': [{'expression': 'ga:sessions'}]
                }]
        }
    ).execute()

    return response['reports'][0]['data']['totals'][0]['values'][0]

visitor_count = get_visitor_count()

# Save the visitor count to a JSON file
with open('static/visitor_count.json', 'w') as f:
    json.dump({'visitors': visitor_count}, f)
