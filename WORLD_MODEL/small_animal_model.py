SMALL_ANIMALS = [

"hedgehog",
"hamster",
"mouse",
"rat",
"shrew",
"squirrel"

]


def detect_small_animal(text):

    text=text.lower()

    for a in SMALL_ANIMALS:

        if a in text:

            return True

    return False


def humane_response():

    options=[

        "ปล่อยสัตว์ตัวนั้นกลับสู่พื้นที่ที่ปลอดภัย",

        "หาน้ำหรืออาหารเล็กน้อยให้เขา เช่นเศษอาหาร",

        "หลีกเลี่ยงการทำร้าย เพราะสัตว์ตัวเล็กส่วนใหญ่กำลังหาอาหารเพื่อเอาชีวิตรอด"

    ]

    return options
