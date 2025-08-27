// types/crypto-js.d.ts - Declaração de tipos para CryptoJS

declare module "crypto-js" {
  interface WordArray {
    toString(encoder?: any): string;
  }

  interface CipherParams {
    toString(): string;
  }

  export namespace AES {
    function encrypt(message: string, key: string): CipherParams;
    function decrypt(ciphertext: string, key: string): WordArray;
  }

  export namespace enc {
    const Utf8: {
      parse(str: string): WordArray;
      stringify(wordArray: WordArray): string;
    };
  }

  export default {
    AES,
    enc,
  };
}
