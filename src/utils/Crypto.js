import CryptoJS from "crypto-js";

const SECRET_KEY = "my_chat_secret_key_123"; // same on all clients

export const encryptMessage = (text) => {
    return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
};

export const decryptMessage = (cipher) => {
    const bytes = CryptoJS.AES.decrypt(cipher, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
};