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
      const base64Image = await toBase64(file);
      b64 = base64Image;
    } catch (error) {
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
