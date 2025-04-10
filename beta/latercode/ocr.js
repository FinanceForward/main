/**
 * Asynchronously performs Optical Character Recognition (OCR) on an image input.
 *
 * @param {HTMLInputElement} imageInput - The input element containing the image file.
 * @returns {Promise<string|Error>} - A promise that resolves to the parsed text from the image, or an error if the operation fails.
 *
 * @throws {Error} If no file is selected or if the file size exceeds 10MB.
 */
async function OCR(imageInput) {
  function toBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
  
  let b64 = '';  
  if (imageInput.files.length > 0) {
    const file = imageInput.files[0];
    if (file.size > 10 * 1024 * 1024) {
      return new Error('File too large');
    }
    try {
      // Convert the file to a base64 string
      const base64Image = await toBase64(file);
      b64 = base64Image;
    } catch (error) {
      // Return the error if the conversion fails
      return error;
    }
  } else {
    return new Error('No file selected');
  }
  
  const url = 'https://api.ocr.space/parse/image';
  let data = new FormData()
  data.set("base64Image", b64)
  data.set("apikey", 'K84105813588957')

  try {
    const response = await fetch(url, {method: 'POST', body: data});
    const json = await response.json();
    return json['ParsedResults'][0]['ParsedText'].replaceAll('\r\n', ' ');
  } catch (error) {
    return error;
  }
}
