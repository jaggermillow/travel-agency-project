import http.server
import socketserver
import webbrowser
import os

PORT = 8000
Handler = http.server.SimpleHTTPRequestHandler

# Ensure we are serving from the script's directory
os.chdir(os.path.dirname(os.path.abspath(__file__)))

print(f"Starting local server at http://localhost:{PORT}")
print("Press Ctrl+C to stop.")

try:
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        # Open browser in a new tab
        webbrowser.open_new_tab(f"http://localhost:{PORT}")
        httpd.serve_forever()
except KeyboardInterrupt:
    print("\nServer stopped.")
except OSError as e:
    print(f"Error starting server: {e}")
    input("Press Enter to exit...")
