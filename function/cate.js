const fs = require('fs').promises;
const { pay } = require('./pay2.js');

async function handleCategoryCommand(socket, remoteJid, category, m) {
    try {
      // Baca file ./database/json/data.json
      const data = await fs.readFile('./database/json/data.json', 'utf8');
      const jsonData = JSON.parse(data);
  
      // Periksa apakah kategori sudah ada dalam ./database/json/data.json
      const normalizedCategory = category.toLowerCase();
      if (jsonData.category.hasOwnProperty(normalizedCategory)) {
        // Ambil items dari kategori yang sesuai
        const items = jsonData.category[normalizedCategory].items;
  
        // Kirim balasan dengan daftar items
        const quotedMessage = m.messages[0];
        const listItem = `Items ${normalizedCategory}:\n${items.join('\n')}`;
        const itemMessage = {
            text: listItem,
            quoted: quotedMessage,

        };
        socket.sendMessage(remoteJid, itemMessage, { quoted: quotedMessage });
      } else {
        // Kategori tidak ditemukan
        const quotedMessage = m.messages[0];
        const elMessage = {
            text: `Tidak ada menu dengan nama ${normalizedCategory}`,
            quoted: quotedMessage,
        }
        socket.sendMessage(remoteJid, elMessage, { quoted: quotedMessage });
      }
    } catch (error) {
      console.error('Error handling category command:', error);
    }
  }

// Fungsi untuk menangani perintah "add"
async function handleAddCommand(socket, remoteJid, category, description, m) {
    try {
      // Baca file data.json
      const data = await fs.readFile('./database/json/data.json', 'utf8');
      const jsonData = JSON.parse(data);
  
      // Periksa apakah kategori sudah ada dalam data.json
      if (jsonData.category.hasOwnProperty(category)) { // Perubahan disini
        // Jika tidak ada deskripsi (item), beri tahu bahwa kategori sudah ada
        if (!description) {
          const adkMessage = `Kategori '${category}' sudah ada.`;
              const quotedMessage = m.messages[0];
              const addkMessage = {
                text: adkMessage,
                quoted: quotedMessage,
              };
              socket.sendMessage(remoteJid, addkMessage, { quoted: quotedMessage });
          return;
        }
  
        // Tambahkan item ke kategori yang sesuai
        jsonData.category[category].items.push(description); // Perubahan disini
  
        // Kirim balasan
        const adiMessage = `Item '${description}' berhasil ditambahkan ke kategori '${category}'.`;
              const quotedMessage = m.messages[0];
              const addiMessage = {
                text: adiMessage,
                quoted: quotedMessage,
              };
              socket.sendMessage(remoteJid, addiMessage, { quoted: quotedMessage });
      } else {
        // Kategori belum ada, tambahkan sebagai kategori baru
        jsonData.category[category] = { items: [] }; // Perubahan disini
  
        // Jika ada deskripsi (item), tambahkan deskripsi sebagai item pertama
        if (description) {
          jsonData.category[category].items.push(description); // Perubahan disini
          const adikMessage = `Kategori '${category}' berhasil ditambahkan dengan item '${description}'.`;
              const quotedMessage = m.messages[0];
              const addikMessage = {
                text: adikMessage,
                quoted: quotedMessage,
              };
              socket.sendMessage(remoteJid, addikMessage, { quoted: quotedMessage });
        } else {
          // Jika tidak ada deskripsi (item), beri tahu bahwa kategori baru sudah ditambahkan
          const adikkMessage = `Kategori '${category}' berhasil ditambahkan.`;
              const quotedMessage = m.messages[0];
              const addikkMessage = {
                text: adikkMessage,
                quoted: quotedMessage,
              };
              socket.sendMessage(remoteJid, addikkMessage, { quoted: quotedMessage });
        }
      }
  
      // Simpan perubahan kembali ke file data.json
      await fs.writeFile('./database/json/data.json', JSON.stringify(jsonData, null, 2), 'utf8');
    } catch (error) {
      console.error('Error handling add command:', error);
    }
  }
  

  async function handleDeleteCommand(socket, remoteJid, category, description, m) {
    try {
      // Baca file data.json
      const data = await fs.readFile('./database/json/data.json', 'utf8');
      const jsonData = JSON.parse(data);
  
      // Periksa apakah kategori sudah ada dalam data.json
      if (jsonData.category.hasOwnProperty(category)) {
        // Periksa apakah ada deskripsi (item) yang akan dihapus
        if (description) {
          const items = jsonData.category[category].items;
          const index = items.indexOf(description);
          if (index !== -1) {
            // Hapus item dari kategori yang sesuai
            items.splice(index, 1);
  
            // Kirim balasan
            const delMessage = `Item '${description}' berhasil dihapus dari kategori '${category}'.`;
              const quotedMessage = m.messages[0];
              const dellMessage = {
                text: delMessage,
                quoted: quotedMessage,
              };
              socket.sendMessage(remoteJid, dellMessage, { quoted: quotedMessage });
          } else {
            // Item tidak ditemukan dalam kategori
            const deleMessage = `Item '${description}' tidak ditemukan dalam kategori '${category}'.`;
              const quotedMessage = m.messages[0];
              const delleMessage = {
                text: deleMessage,
                quoted: quotedMessage,
              };
              socket.sendMessage(remoteJid, delleMessage, { quoted: quotedMessage });
          }
        } else {
          // Tidak ada deskripsi (item) yang diberikan, hapus seluruh kategori
          delete jsonData.category[category];
  
          // Kirim balasan
          const deliMessage = `Kategori '${category}' berhasil dihapus.`;
              const quotedMessage = m.messages[0];
              const delliMessage = {
                text: deliMessage,
                quoted: quotedMessage,
              };
              socket.sendMessage(remoteJid, delliMessage, { quoted: quotedMessage });
        }
  
        // Simpan perubahan kembali ke file data.json
        await fs.writeFile('./database/json/data.json', JSON.stringify(jsonData, null, 2), 'utf8');
      } else {
        // Kategori tidak valid
        const delkMessage = `Kategori '${category}' tidak ditemukan.`;
              const quotedMessage = m.messages[0];
              const dellkMessage = {
                text: delkMessage,
                quoted: quotedMessage,
              };
              socket.sendMessage(remoteJid, dellkMessage, { quoted: quotedMessage });
      }
    } catch (error) {
      console.error('Error handling delete command:', error);
    }
  }

  
// Fungsi untuk menangani perintah "menu"
async function handleCommand(socket, remoteJid, m, category) {
    try {
        // Baca file data.json
        const data = await fs.readFile('./database/json/data.json', 'utf8');
        const jsonData = JSON.parse(data);

        // Ambil semua kategori dari data.json
        const allCategories = Object.keys(jsonData.category);

        // Tambahkan "PAY" ke daftar kategori jika belum ada
        if (!allCategories.includes('PAY')) {
            allCategories.push('PAY');
        }

        // Panggil fungsi handlePayCommand dari pay.js jika category adalah "PAY"
        if (category.toUpperCase() === 'PAY') {
            // Pastikan message memiliki quoted message sebelum memanggil handlePayCommand
            if (m.quotedMessage) {
                await pay(socket, remoteJid, m);
            } else {
                // Jika pesan tidak memiliki quoted message, kirim balasan tanpa quoted message
                const contohText = `Daftar Kategori:\n${allCategories.join('\n')}`;
                const quotedMessage = m.messages[0];
                const contoh = {
                    text: contohText,
                    quoted: quotedMessage,
                };
                socket.sendMessage(remoteJid, contoh, { quoted: quotedMessage });
            }
            return;
        }

        // Kirim balasan dengan daftar semua kategori, meng-quoted message yang mengirim permintaan menu
        const contohText = `Daftar Kategori:\n${allCategories.join('\n')}`;
        const quotedMessage = m.messages[0];
        const contoh = {
            text: contohText,
            quoted: quotedMessage,
        };
        socket.sendMessage(remoteJid, contoh, { quoted: quotedMessage });
    } catch (error) {
        console.error('Error handling menu command:', error);
    }
}




module.exports = { handleCategoryCommand, handleAddCommand, handleDeleteCommand, handleCommand };