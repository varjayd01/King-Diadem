def run_decision(text: str):

    # โหมดขั้นต่ำให้ระบบรันได้ก่อน
    # พี่สามารถเอา logic จริงมาใส่เพิ่มทีหลังได้

    try:
        from ENGINE.realhuman_survivorengine import survival_check

        survival = survival_check(text)

    except:
        survival = {"status": "fallback"}

    return {
        "input": text,
        "survival": survival
    }
