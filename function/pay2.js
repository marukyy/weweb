// pay2.js

const fs = require('fs');
const path = require('path');

let currentImage = null;
let currentCaption = null;

function readConfig() {
  const configPath = path.join(__dirname, '../database/json/caption.json');
  try {
    const configData = fs.readFileSync(configPath, 'utf-8');
    const configJson = JSON.parse(configData);
    return configJson;
  } catch (error) {
    console.error('Error reading caption.json:', error);
    return null; // Fallback to default values
  }
}

function writeConfig(configData) {
  const configPath = path.join(__dirname, '../database/json/caption.json');
  try {
    fs.writeFileSync(configPath, JSON.stringify(configData, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing caption.json:', error);
  }
}

function readCaption() {
  const config = readConfig();
  return config ? config.defaultCaption : 'Silahkan Transfer Ke QRIS diatas\nDana 082257477031 AN Tempek Angop';
}

function readImage() {
  const config = readConfig();
  return config ? config.defaultImagePath : null;
}

function setImg(newImg) {
  currentImage = newImg;
  try {
    const config = readConfig();
    if (config) {
      config.defaultImagePath = currentImage;
      writeConfig(config);
    } else {
      console.error('Error reading caption.json. Cannot set image path.');
    }
  } catch (error) {
    console.error('Error writing caption.json:', error);
  }
}


function setCaption(newCaption) {
  currentCaption = newCaption;
  try {
    const config = readConfig();
    if (config) {
      config.defaultCaption = currentCaption;
      writeConfig(config);
    } else {
      console.error('Error reading caption.json. Cannot set caption.');
    }
  } catch (error) {
    console.error('Error writing caption.json:', error);
  }
}

async function pay(socket, remoteJid, m) {
  const quotedMessage = m.messages[0];

  // Baca path gambar default dari file JSON
  const defaultImagePath = readImage();

  if (defaultImagePath) {
    currentImage = defaultImagePath; // Set path gambar saat membaca dari file JSON
  }

  const imageBuffer = fs.readFileSync(currentImage);
  const caption = readCaption(); // Baca caption dari config.json
  const messageOptions = {
    image: imageBuffer,
    caption: caption,
    quoted: quotedMessage,
  };

  // Kirim gambar sebagai quoted message
  await socket.sendMessage(remoteJid, messageOptions, { quoted: quotedMessage });
}

module.exports = { pay, setImg, setCaption };
