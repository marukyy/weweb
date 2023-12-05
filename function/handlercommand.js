const axios = require('axios');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  MessageType,
} = require('@whiskeysockets/baileys');
const Pino = require('pino');
const { handleOrderMessage } = require('./order.js');
const {
  handleAddCommand,
  handleDeleteCommand,
  handleCategoryCommand,
  handleCommand,
} = require('./cate.js');
const { pay } = require('./pay2.js');

async function isAllowedNumber(senderNumber) {
  // Daftar nomor yang diizinkan
  const allowedNumbers = ['6281268268436@s.whatsapp.net', '6281232669780@s.whatsapp.net'];
  return allowedNumbers.includes(senderNumber);
}

async function getBotIpAddress() {
  try {
    const response = await axios.get('https://api.ipify.org?format=json');
    return response.data.ip;
  } catch (error) {
    console.error('Error getting IP address:', error.message);
    throw error;
  }
}

async function handleIpCommand(socket, remoteJid) {
  try {
    const botIpAddress = await getBotIpAddress();
    const message = `Alamat IP bot saat ini adalah: ${botIpAddress}`;
    socket.sendMessage(remoteJid, { text: message });
  } catch (error) {
    const errorMessage = 'Terjadi kesalahan saat mendapatkan alamat IP bot.';
    socket.sendMessage(remoteJid, { text: errorMessage });
  }
}

async function connectToWhatsapp() {
  const auth = await useMultiFileAuthState('auth');
  const socket = makeWASocket({
    printQRInTerminal: true,
    browser: ['MamangSomay', 'Firefox', '1.0.0'],
    auth: auth.state,
    logger: Pino({ level: 'silent' }),
  });

  socket.ev.on('creds.update', auth.saveCreds);
  socket.ev.on('connection.update', ({ connection }) => {
    if (connection === 'open') {
      console.log('Koneksi Terbuka');
    }
    if (connection === 'close') {
      connectToWhatsapp();
    }
  });

  socket.ev.on('messages.upsert', async (m) => {
    if (
      m.messages &&
      m.messages[0] &&
      m.messages[0].message &&
      !m.messages[0].key.fromMe
    ) {
      const remoteJid = m.messages[0].key.remoteJid;
      const senderNumber = m.messages[0].key.participant || m.messages[0].key.remoteJid;
      console.log('Pesan masuk dari ID Grup:', remoteJid);
      console.log('Nomor Pengirim:', senderNumber);

      try {
        console.log('Conversation:', m.messages[0].message.conversation);
        const words = m.messages[0].message.conversation.split(' ');
        console.log('Words:', words);

        switch (words[0].toUpperCase()) {
          case 'ORDER':
            if (words.length >= 3) {
              await handleOrderMessage(socket, remoteJid, words, m);
            } else {
              socket.sendMessage(remoteJid, {
                text: 'Format !order tidak valid. Gunakan: !order buyerskucode idgame-idserver',
              });
            }
            break;

          case 'PAY':
            await pay(socket, remoteJid, m);
            break;

          case 'MENU':
            await handleCommand(socket, remoteJid, m, 'menu');
            break;

          case 'ADD':
            if (words.length >= 2) {
              const category = words[1].toLowerCase();
              const description = words.slice(2).join(' ');

              if (await isAllowedNumber(senderNumber)) {
                await handleAddCommand(socket, remoteJid, category, description, m);
              } else {
                socket.sendMessage(remoteJid, {
                  text: 'Maaf, Anda tidak diizinkan untuk menggunakan perintah ini.',
                });
              }
            } else {
              const adMessage =
                'Format !add tidak valid. Gunakan: !add category atau !add category description';
              const quotedMessage = m.messages[0];
              const addMessage = {
                text: adMessage,
                quoted: quotedMessage,
              };
              socket.sendMessage(remoteJid, addMessage, { quoted: quotedMessage });
            }
            break;

          case 'DELETE':
            if (words.length >= 2) {
              const category = words[1].toLowerCase();
              const description = words.slice(2).join(' ');

              if (await isAllowedNumber(senderNumber)) {
                await handleDeleteCommand(socket, remoteJid, category, description, m);
              } else {
                socket.sendMessage(remoteJid, {
                  text: 'Maaf, Anda tidak diizinkan untuk menggunakan perintah ini.',
                });
              }
            } else {
              const salMessage =
                'Format !delete tidak valid. Gunakan: !delete category atau !delete category description';
              const quotedMessage = m.messages[0];
              const allText = {
                text: salMessage,
                quoted: quotedMessage,
              };
              socket.sendMessage(remoteJid, allText, { quoted: quotedMessage });
            }
            break;

          case 'IP':
            await handleIpCommand(socket, remoteJid);
            break;

          default:
            if (words[0].startsWith('!')) {
              const category = words[0].substring(1).toLowerCase();
              await handleCategoryCommand(socket, remoteJid, category, m);
            } else {
              console.log('Ignoring unknown command:', m.messages[0].message.conversation);
            }
            break;
        }
      } catch (error) {
        console.error('Error reading owner.json:', error);
      }
    }
  });
}

connectToWhatsapp().catch((err) => {
  console.error('Error in WhatsApp connection:', err);
});
