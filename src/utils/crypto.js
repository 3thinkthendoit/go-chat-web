// crypto.js
import CryptoJS from 'crypto-js';



export const Crypto = {
    AES: {
        encrypt: function (plaintext) {
            const secretKey = "!@#$%^&*()987123"
            return CryptoJS.AES.encrypt(plaintext, secretKey).toString();
        },
        decrypt: function (ciphertext) {
            const secretKey = "!@#$%^&*()987123"
            const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
            return bytes.toString(CryptoJS.enc.Utf8);
        }
    },
    Msg: {
        isWhitespace: function (str) {
            return /^\s*$/.test(str);
        },
        decrypt: function (msg) {
            try {
                let content = Crypto.AES.decrypt(msg)
                if (!this.isWhitespace(content)) {
                    return content
                }
            } catch (e) {
                console.log(e)
            }
            return msg
        }
    }
};

