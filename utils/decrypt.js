// const CryptoJS = require('crypto-js')

// class WebEncryption {
//     #base64Key;
//     #plainKey;

//     constructor(key) {
//         this.#base64Key = CryptoJS.enc.Base64.parse(key);
//         this.#plainKey = key;
//     }

//     decrypt(crypted_data) {
//         const bytes = Buffer.from(crypted_data, "base64");
//         const str = bytes.toString();

//         if (str.startsWith("Salted")) {
//             let bytes = CryptoJS.AES.decrypt(crypted_data, this.#plainKey);
//             let originalText = bytes.toString(CryptoJS.enc.Utf8);

//             return originalText;
//         } else {
//             const data = JSON.parse(str);
//             const iv = CryptoJS.enc.Base64.parse(data.iv);
//             const value = CryptoJS.enc.Base64.parse(data.value);
//             const decrypted = CryptoJS.AES.decrypt(
//                 { ciphertext: value },
//                 this.#base64Key,
//                 {
//                     iv: iv,
//                     mode: CryptoJS.mode.CBC,
//                 }
//             );
//             const decrypted_text = decrypted.toString(CryptoJS.enc.Utf8);

//             return decrypted_text;
//         }
//     }

//     encrypt(data) {
//         const encryptedData = CryptoJS.AES.encrypt(
//             data.toString(),
//             this.#plainKey
//         ).toString();

//         return encryptedData;
//     }
// }


// module.exports = WebEncryption

