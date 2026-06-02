# gunicorn.conf.py — วางที่ root project
# ★ FIX: timeout 300s แทน 120s
timeout = 300
keepalive = 5
worker_class = "uvicorn.workers.UvicornWorker"
workers = 1
loglevel = "info"
