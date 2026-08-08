import pytesseract
from PIL import Image, ImageEnhance

pytesseract.pytesseract.tesseract_cmd = (
    r"C:\Program Files\Tesseract-OCR\tesseract.exe"
)


def extract_text(image_file):
    """
    Extract text from an uploaded email screenshot.
    Supports English and Hindi (Devanagari).
    """

    image = Image.open(image_file)

    # Enlarge image for better OCR
    image = image.resize(
        (image.width * 2, image.height * 2)
    )

    # Convert to grayscale
    image = image.convert("L")

    # Increase contrast
    image = ImageEnhance.Contrast(image).enhance(2)

    # OCR
    extracted_text = pytesseract.image_to_string(
        image,
        lang="eng",
        config="--psm 6"
    )

    return extracted_text


if __name__ == "__main__":
    image_path = r"C:\Users\Aryan\Desktop\WhatsApp Image 2026-08-06 at 10.23.06 PM.jpeg"

    text = extract_text(image_path)

    print("\n--- EXTRACTED TEXT ---")
    print(text)