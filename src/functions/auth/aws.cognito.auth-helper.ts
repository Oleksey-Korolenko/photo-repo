import { BigInteger } from '@libs/bigInteger';
import { WordArray } from '@libs/wordArray';
import { SHA256, HmacSHA256, lib } from 'crypto-js';

const initN =
  'FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD1' +
  '29024E088A67CC74020BBEA63B139B22514A08798E3404DD' +
  'EF9519B3CD3A431B302B0A6DF25F14374FE1356D6D51C245' +
  'E485B576625E7EC6F44C42E9A637ED6B0BFF5CB6F406B7ED' +
  'EE386BFB5A899FA5AE9F24117C4B1FE649286651ECE45B3D' +
  'C2007CB8A163BF0598DA48361C55D39A69163FA8FD24CF5F' +
  '83655D23DCA3AD961C62F356208552BB9ED529077096966D' +
  '670C354E4ABC9804F1746C08CA18217C32905E462E36CE3B' +
  'E39E772C180E86039B2783A2EC07A28FB5C55DF06F4C52C9' +
  'DE2BCBF6955817183995497CEA956AE515D2261898FA0510' +
  '15728E5A8AAAC42DAD33170D04507A33A85521ABDF1CBA64' +
  'ECFB850458DBEF0A8AEA71575D060C7DB3970F85A6E1E4C7' +
  'ABF5AE8CDB0933D71E8C94E04A25619DCEE3D2261AD2EE6B' +
  'F12FFA06D98A0864D87602733EC86A64521F2B18177B200C' +
  'BBE117577A615D6C770988C0BAD946E208E24FA074E5AB31' +
  '43DB5BFCE0FD108E4B82D120A93AD2CAFFFFFFFFFFFFFFFF';

const HEX_MSB_REGEX = /^[89a-f]/i;

export default class AWSCognitoAuthHelper {
  #poolName: string;

  #largeAValue: BigInteger | undefined;
  #smallAValue: BigInteger;
  #N: BigInteger;
  #g: BigInteger;
  #k: BigInteger;
  #UHexHash: string;
  #UValue: BigInteger;
  #infoBits: Buffer;

  constructor(poolName: string) {
    this.#largeAValue = undefined;
    this.#smallAValue = this.#generateRandomSmallA();
    this.#N = new BigInteger(initN, 16);
    this.#g = new BigInteger('2', 16);
    this.#k = new BigInteger(
      this.hexHash(`${this.padHex(this.#N)}${this.padHex(this.#g)}`),
      16
    );

    this.#infoBits = Buffer.from('Caldera Derived Key', 'utf8');

    this.#poolName = poolName;
  }

  #generateRandomSmallA = (): BigInteger => {
    const hexRandom = Buffer.from(
      new WordArray().random(128).toString(),
      'hex'
    ).toString('hex');

    const randomBigInt = new BigInteger(hexRandom, 16);

    return randomBigInt;
  };

  getLargeAValue = (): BigInteger => {
    if (this.#largeAValue !== undefined) {
      return this.#largeAValue;
    } else {
      const largeAValue = this.#calculateA(this.#smallAValue);

      this.#largeAValue = largeAValue;

      return largeAValue;
    }
  };

  #calculateA = (a: BigInteger): BigInteger => {
    const A = this.#g.modPow(a, this.#N);

    if (A.mod(this.#N).equals(BigInteger.ZERO)) {
      throw new Error('Illegal paramater. A mod N cannot be 0.');
    }

    return A;
  };

  getPasswordAuthenticationKey = (
    username: string,
    password: string,
    serverBValue: BigInteger,
    salt: BigInteger
  ): Buffer => {
    if (serverBValue.mod(this.#N).equals(BigInteger.ZERO)) {
      throw new Error('B cannot be zero.');
    }

    this.#UValue = this.calculateU(this.#largeAValue, serverBValue);

    if (this.#UValue.equals(BigInteger.ZERO)) {
      throw new Error('U cannot be zero.');
    }

    const usernamePassword = `${this.#poolName}${username}:${password}`;
    const usernamePasswordHash = this.hash(usernamePassword);

    const xValue = new BigInteger(
      this.hexHash(this.padHex(salt) + usernamePasswordHash),
      16
    );
    const sValue = this.calculateS(xValue, serverBValue);

    const hkdf = this.computehkdf(
      Buffer.from(this.padHex(sValue), 'hex'),
      Buffer.from(this.padHex(this.#UValue), 'hex')
    );

    return hkdf;
  };

  computehkdf = (ikm: Buffer, salt: Buffer): Buffer => {
    const infoBitsWordArray = lib.WordArray.create(
      Buffer.concat([
        this.#infoBits,
        Buffer.from(String.fromCharCode(1), 'utf8'),
      ]) as unknown as number[]
    );
    const ikmWordArray =
      ikm instanceof Buffer
        ? lib.WordArray.create(ikm as unknown as number[])
        : ikm;
    const saltWordArray =
      salt instanceof Buffer
        ? lib.WordArray.create(salt as unknown as number[])
        : salt;

    const prk = HmacSHA256(ikmWordArray, saltWordArray);
    const hmac = HmacSHA256(infoBitsWordArray as any, prk);
    return Buffer.from(hmac.toString(), 'hex').slice(0, 16);
  };

  calculateS = (xValue: BigInteger, serverBValue: BigInteger): BigInteger => {
    const gModPowXN = this.#g.modPow(xValue, this.#N);

    const intValue2 = serverBValue.subtract(this.#k.multiply(gModPowXN));
    const result = intValue2.modPow(
      this.#smallAValue.add(this.#UValue.multiply(xValue)),
      this.#N
    );

    return result.mod(this.#N);
  };

  calculateU = (A: BigInteger, B: BigInteger): BigInteger => {
    this.#UHexHash = this.hexHash(this.padHex(A) + this.padHex(B));
    const finalU = new BigInteger(this.#UHexHash, 16);

    return finalU;
  };

  padHex = (bigInt: BigInteger): string => {
    if (!(bigInt instanceof BigInteger)) {
      throw new Error('Not a BigInteger');
    }

    const isNegative = bigInt.compareTo(BigInteger.ZERO) < 0;

    let hexStr: string = bigInt.abs().toString(16);

    hexStr = hexStr.length % 2 !== 0 ? `0${hexStr}` : hexStr;

    hexStr = HEX_MSB_REGEX.test(hexStr) ? `00${hexStr}` : hexStr;

    if (isNegative) {
      const invertedNibbles = hexStr
        .split('')
        .map((x) => {
          const invertedNibble = ~parseInt(x, 16) & 0xf;
          return '0123456789ABCDEF'.charAt(invertedNibble);
        })
        .join('');

      const flippedBitsBI = new BigInteger(invertedNibbles, 16).add(
        BigInteger.ONE
      );

      hexStr = flippedBitsBI.toString(16);

      if (hexStr.toUpperCase().startsWith('FF8')) {
        hexStr = hexStr.substring(2);
      }
    }

    return hexStr;
  };

  hexHash = (hexStr: string): string => {
    return this.hash(Buffer.from(hexStr, 'hex'));
  };

  hash = (buf: Buffer | string): string => {
    const str =
      buf instanceof Buffer
        ? lib.WordArray.create(buf as unknown as number[])
        : buf;
    const hashHex = SHA256(str).toString();

    return new Array(64 - hashHex.length).join('0') + hashHex;
  };
}
