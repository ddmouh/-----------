# run_all.py - Starts both the server and client

import subprocess
import os
import sys
import threading

# Force UTF-8 output so Next.js Unicode chars (▲ etc.) don't crash on Windows
if sys.stdout.encoding != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SERVER_DIR = os.path.join(BASE_DIR, "server")
CLIENT_DIR = os.path.join(BASE_DIR, "client")


def stream_output(process, prefix, color_code):
    for line in iter(process.stdout.readline, b""):
        text = line.decode("utf-8", errors="replace").rstrip()
        print(f"\033[{color_code}m[{prefix}]\033[0m {text}", flush=True)


def run():
    processes = []
    print("\033[1;36m=== Starting Dev Environment ===\033[0m\n")
    try:
        print("\033[33m[server]\033[0m Starting server ...")
        server_proc = subprocess.Popen(
            "npm start",
            cwd=SERVER_DIR,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            shell=True,
        )
        processes.append(server_proc)

        print("\033[32m[client]\033[0m Starting client ...")
        client_proc = subprocess.Popen(
            "npm run dev",
            cwd=CLIENT_DIR,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            shell=True,
        )
        processes.append(client_proc)

        threads = [
            threading.Thread(target=stream_output, args=(server_proc, "server", "33"), daemon=True),
            threading.Thread(target=stream_output, args=(client_proc, "client", "32"), daemon=True),
        ]
        for t in threads:
            t.start()

        print("\n\033[1;36mBoth processes started. Press Ctrl+C to stop all.\033[0m\n")

        while True:
            for p in processes:
                ret = p.poll()
                if ret is not None:
                    name = "server" if p is server_proc else "client"
                    print(f"\n\033[31m[{name}] exited with code {ret}\033[0m")
                    raise SystemExit(ret)
            for t in threads:
                t.join(timeout=0.5)

    except KeyboardInterrupt:
        print("\n\033[1;31mStopping all processes...\033[0m")
    finally:
        for p in processes:
            if p.poll() is None:
                p.terminate()
                try:
                    p.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    p.kill()
        print("\033[1;36mAll processes stopped. Goodbye!\033[0m")


if __name__ == "__main__":
    run()
