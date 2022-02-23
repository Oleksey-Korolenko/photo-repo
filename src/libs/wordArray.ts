import * as crypto from 'crypto';

const hexStringify = (wordArray: WordArray): string => {
  const words = wordArray.words;
  const sigBytes = wordArray.sigBytes;

  const hexChars = [];
  for (let i = 0; i < sigBytes; i++) {
    const bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
    hexChars.push((bite >>> 4).toString(16));
    hexChars.push((bite & 0x0f).toString(16));
  }

  return hexChars.join('');
};

export class WordArray {
  words: number[];
  sigBytes: number;

  constructor(
    words: number[] | undefined = undefined,
    sigBytes: number | undefined = undefined
  ) {
    words = this.words = words || [];

    if (sigBytes !== undefined) {
      this.sigBytes = sigBytes;
    } else {
      this.sigBytes = words.length * 4;
    }
  }

  random = (nBytes: number): WordArray => {
    const words = [];

    for (let i = 0; i < nBytes; i += 4) {
      words.push(crypto.randomBytes(4).readInt32LE());
    }

    return new WordArray(words, nBytes);
  };

  toString = (): string => {
    return hexStringify(this);
  };
}
