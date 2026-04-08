# run_brain.py

from consciousness import consciousness

def main():
    print("🧠 AI is alive... (type 'exit' to quit)")
    
    while True:
        user_input = input(">> ")

        if user_input.lower() == "exit":
            print("👋 shutting down...")
            break

        result = consciousness(user_input)
        print("AI:", result)

if __name__ == "__main__":
    main()
