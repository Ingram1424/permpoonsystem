import os
import sys
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

PORT = 8888

class SPARequestHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        # Strip query params for file lookup
        clean_path = self.path.split('?')[0].split('#')[0]
        local_file = os.path.join(os.getcwd(), clean_path.lstrip('/'))
        
        # If requested path is an existing file, serve it
        if clean_path != '/' and os.path.isfile(local_file):
            return super().do_GET()
            
        if clean_path == '/logo.png':
            alt_logo = os.path.join(os.getcwd(), 'static', 'logo.png')
            if os.path.isfile(alt_logo):
                self.path = '/static/logo.png'
                return super().do_GET()
            
        # Otherwise fallback to demo.html (SPA router)
        self.path = '/demo.html'
        return super().do_GET()

def run():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    server_address = ('0.0.0.0', PORT)
    httpd = ThreadingHTTPServer(server_address, SPARequestHandler)
    print(f"🚀 เซิร์ฟเวอร์ระบบจัดการบริษัทเพิ่มพูน พร้อมทำงานแล้วที่ http://localhost:{PORT}")
    print(f"🔗 เปิดดูในเบราว์เซอร์ได้ที่: http://localhost:{PORT}")
    print("กด Ctrl+C เพื่อหยุดการทำงาน")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nหยุดการทำงานเซิร์ฟเวอร์เรียบร้อย")
        httpd.server_close()

if __name__ == '__main__':
    run()
