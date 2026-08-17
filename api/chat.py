from http.server import BaseHTTPRequestHandler
import json
import os
import google.generativeai as genai

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            data = json.loads(body.decode('utf-8'))
            user_message = data.get('message', '').strip()

            if not user_message:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'Message is required'}).encode('utf-8'))
                return

            api_key = os.environ.get('GEMINI_API_KEY')
            if not api_key:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'GEMINI_API_KEY is not configured on the server.'}).encode('utf-8'))
                return

            genai.configure(api_key=api_key)

            system_instruction = (
                "You are Sabin Gautam's AI assistant on his portfolio website. "
                "Sabin Gautam is a Full-Stack Python Engineer and AI Agent Architect with 8+ years of experience. "
                "His core tech stack includes Python, Django, FastAPI, LangGraph, PostgreSQL, Docker, AWS, and Redis. "
                "He builds scalable web applications, enterprise analytics platforms, microservices, multi-agent orchestration systems, and RAG knowledge assistants. "
                "Be professional, concise, helpful, and friendly. Answer questions about Sabin's experience, skills, projects, and how to contact him (sabingautam05@gmail.com)."
            )

            model = genai.GenerativeModel(
                model_name='gemini-1.5-flash',
                system_instruction=system_instruction
            )

            chat = model.start_chat(history=[])
            response = chat.send_message(user_message)
            bot_reply = response.text

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'reply': bot_reply}).encode('utf-8'))

        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode('utf-8'))
