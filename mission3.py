import base64
import json
import time
import hmac
import hashlib
import struct
import requests
from urllib.parse import quote_plus

def get_totp_token(secret):
    # Get current timestamp in 30-second intervals
    interval = int(time.time()) // 30
    
    # Convert interval to bytes (big-endian)
    msg = struct.pack(">Q", interval)
    
    # Generate HMAC-SHA512 hash
    h = hmac.new(secret.encode('utf-8'), msg, hashlib.sha512).digest()
    
    # Dynamic truncation
    offset = h[-1] & 0xf
    binary = ((h[offset] & 0x7f) << 24 | (h[offset + 1] & 0xff) << 16 | 
              (h[offset + 2] & 0xff) << 8 | (h[offset + 3] & 0xff))
    
    # Get 10-digit code
    token = binary % 10**10
    return f"{token:010d}"

def send_request():
    # Replace these with your actual information
    GIST_URL = "https://gist.github.com/Leojin7/40ddb0da45610b46c7612e7c84301d63"
    EMAIL = "leo18jin@gmail.com"
    
    # Generate shared secret
    shared_secret = f"{EMAIL}HENNGECHALLENGE004"
    
    # Get TOTP token
    totp = get_totp_token(shared_secret)
    
    # Prepare the request data
    data = {
        "github_url": GIST_URL,
        "contact_email": EMAIL,
        "solution_language": "python"
    }
    
    # Encode credentials for Basic Auth
    credentials = f"{EMAIL}:{totp}"
    encoded_credentials = base64.b64encode(credentials.encode('utf-8')).decode('utf-8')
    
    # Set up headers
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Basic {encoded_credentials}'
    }
    
    # Make the POST request
    url = "https://api.challenge.hennge.com/challenges/backend-recursion/004"
    
    try:
        response = requests.post(
            url,
            headers=headers,
            data=json.dumps(data),
            timeout=10
        )
        
        print(f"Status Code: {response.status_code}")
        print("Response:", response.text)
        
    except requests.exceptions.RequestException as e:
        print(f"Error making request: {e}")

if __name__ == "__main__":
    send_request()
