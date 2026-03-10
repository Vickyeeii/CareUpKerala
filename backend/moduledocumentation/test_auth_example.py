"""
Example usage of CareUp Auth Module

This file demonstrates how to use the authentication system.
Run the server first: uvicorn main:app --reload
"""

import requests

BASE_URL = "http://localhost:8000"

# Example 1: Register NRI User
def register_nri():
    response = requests.post(f"{BASE_URL}/auth/nri/signup", json={
        "full_name": "John Doe",
        "email": "john@example.com",
        "password": "securepass123",
        "phone": "+1234567890",
        "country": "USA"
    })
    print("NRI Registration:", response.json())
    return response.json()

# Example 2: Register Companion
def register_companion():
    response = requests.post(f"{BASE_URL}/auth/companion/signup", json={
        "full_name": "Jane Smith",
        "email": "jane@example.com",
        "password": "securepass123",
        "phone": "+9876543210"
    })
    print("Companion Registration:", response.json())
    return response.json()

# Example 3: Login
def login(email, password):
    response = requests.post(f"{BASE_URL}/auth/login", json={
        "email": email,
        "password": password
    })
    print("Login:", response.json())
    return response.json()

# Example 4: Access Protected Route
def access_protected(access_token):
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.get(f"{BASE_URL}/protected", headers=headers)
    print("Protected Route:", response.json())
    return response.json()

# Example 5: Refresh Token
def refresh_token(refresh_token):
    response = requests.post(f"{BASE_URL}/auth/refresh", json={
        "refresh_token": refresh_token
    })
    print("Token Refresh:", response.json())
    return response.json()

# Example 6: Logout
def logout(refresh_token):
    response = requests.post(f"{BASE_URL}/auth/logout", json={
        "refresh_token": refresh_token
    })
    print("Logout:", response.json())
    return response.json()

# Full workflow example
if __name__ == "__main__":
    print("=== CareUp Auth Module Test ===\n")
    
    # Register and login as NRI
    print("1. Registering NRI user...")
    register_nri()
    
    print("\n2. Logging in...")
    login_response = login("john@example.com", "securepass123")
    access_token = login_response["access_token"]
    refresh_token_str = login_response["refresh_token"]
    
    print("\n3. Accessing protected route...")
    access_protected(access_token)
    
    print("\n4. Refreshing access token...")
    refresh_response = refresh_token(refresh_token_str)
    new_access_token = refresh_response["access_token"]
    
    print("\n5. Logging out...")
    logout(refresh_token_str)
    
    print("\n=== Test Complete ===")
