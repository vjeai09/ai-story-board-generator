import requests

def main():
    token = "<token from hugging face>"

    API_URL = "https://api-inference.huggingface.co/models/gpt2"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }
    data = {
        "inputs": "Hello world"
    }

    import traceback
    try:
        response = requests.post(API_URL, headers=headers, json=data)
        print("Status Code:", response.status_code)
    except Exception as e:
        print("An error occurred:")
        traceback.print_exc()
        return
    try:
        print("Response JSON:", response.json())
    except Exception:
        print("Response Text:", response.text)

if __name__ == "__main__":
    main()
