import CryptoJS from "crypto-js";
import { showErrorToast } from "@/components/ui/sonner";

const SECRET_KEY = "sua-chave-secreta-super-segura";

export const encryptData = (data: any): string => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
};

export const decryptData = (cipherText: string): any => {
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedData);
  } catch (error) {
    showErrorToast("Erro ao descriptografar dados");
    try {
      return JSON.parse(cipherText);
    } catch {
      return null;
    }
  }
};

export function isEncrypted(data: string): boolean {
  try {
    const decrypted = decryptData(data);
    return decrypted !== null;
  } catch {
    return false;
  }
}
