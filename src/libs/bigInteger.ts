import { String } from 'aws-sdk/clients/batch';

const nbi = () => {
  return new BigInteger(null);
};

export class BigInteger {
  t: number;
  s: number;
  #BI_RC: number[];

  DB: number;
  DM: number;
  DV: number;

  #BI_RM: String;

  #FV: number;
  #F1: number;
  #F2: number;

  static nbv = (i: number) => {
    const r = nbi();

    r.fromInt(i);

    return r;
  };

  static ZERO: BigInteger = this.nbv(0);
  static ONE: BigInteger = this.nbv(1);

  constructor(a?: string, b?: number) {
    this.#BI_RC = [];

    let rr, vv;
    rr = '0'.charCodeAt(0);
    for (vv = 0; vv <= 9; ++vv) this.#BI_RC[rr++] = vv;
    rr = 'a'.charCodeAt(0);
    for (vv = 10; vv < 36; ++vv) this.#BI_RC[rr++] = vv;
    rr = 'A'.charCodeAt(0);
    for (vv = 10; vv < 36; ++vv) this.#BI_RC[rr++] = vv;

    this.DB = 28;
    this.DM = (1 << this.DB) - 1;
    this.DV = 1 << this.DB;

    this.#BI_RM = '0123456789abcdefghijklmnopqrstuvwxyz';

    const BI_FP = 52;
    this.#FV = Math.pow(2, BI_FP);
    this.#F1 = BI_FP - this.DB;
    this.#F2 = 2 * this.DB - BI_FP;

    if (a !== null) this.fromString(a, b);
  }

  am = (
    i: number,
    x: number,
    w: BigInteger,
    j: number,
    c: number,
    n: number
  ): number => {
    const xl = x & 0x3fff,
      xh = x >> 14;
    while (--n >= 0) {
      let l = this[i] & 0x3fff;
      let h = this[i++] >> 14;
      let m = xh * l + h * xl;
      l = xl * l + ((m & 0x3fff) << 14) + w[j] + c;
      c = (l >> 28) + (m >> 14) + xh * h;
      w[j++] = l & 0xfffffff;
    }
    return c;
  };

  intAt = (s: string, i: number): number => {
    const c = this.#BI_RC[s.charCodeAt(i)];
    return c == null ? -1 : c;
  };

  clamp = (): void => {
    const c = this.s & this.DM;
    while (this.t > 0 && this[this.t - 1] == c) --this.t;
  };

  subTo = (a: BigInteger, r: BigInteger): void => {
    let i = 0,
      c = 0;
    const m = Math.min(a.t, this.t);
    while (i < m) {
      c += this[i] - a[i];
      r[i++] = c & this.DM;
      c >>= this.DB;
    }
    if (a.t < this.t) {
      c -= a.s;
      while (i < this.t) {
        c += this[i];
        r[i++] = c & this.DM;
        c >>= this.DB;
      }
      c += this.s;
    } else {
      c += this.s;
      while (i < a.t) {
        c -= a[i];
        r[i++] = c & this.DM;
        c >>= this.DB;
      }
      c -= a.s;
    }
    r.s = c < 0 ? -1 : 0;
    if (c < -1) r[i++] = this.DV + c;
    else if (c > 0) r[i++] = c;
    r.t = i;
    r.clamp();
  };

  abs = (): BigInteger => {
    return this.s < 0 ? this.negate() : this;
  };

  negate = (): BigInteger => {
    const r = nbi();

    BigInteger.ZERO.subTo(this, r);

    return r;
  };

  mod = (a: BigInteger): BigInteger => {
    const r = nbi();
    this.abs().divRemTo(a, null, r);
    if (this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) a.subTo(r, r);
    return r;
  };

  add = (a: BigInteger): BigInteger => {
    const r = nbi();

    this.addTo(a, r);

    return r;
  };

  multiply = (a: BigInteger): BigInteger => {
    const r = nbi();

    this.multiplyTo(a, r);

    return r;
  };

  subtract = (a: BigInteger): BigInteger => {
    const r = nbi();

    this.subTo(a, r);

    return r;
  };

  equals = (a: BigInteger): boolean => {
    return this.compareTo(a) == 0;
  };

  invDigit = (): number => {
    if (this.t < 1) return 0;
    const x = this[0];
    if ((x & 1) == 0) return 0;
    let y = x & 3;
    y = (y * (2 - (x & 0xf) * y)) & 0xf;
    y = (y * (2 - (x & 0xff) * y)) & 0xff;
    y = (y * (2 - (((x & 0xffff) * y) & 0xffff))) & 0xffff;
    y = (y * (2 - ((x * y) % this.DV))) % this.DV;
    return y > 0 ? this.DV - y : -y;
  };

  copyTo = (r: BigInteger): void => {
    for (let i = this.t - 1; i >= 0; --i) r[i] = this[i];
    r.t = this.t;
    r.s = this.s;
  };

  nbits = (x: number): number => {
    let r = 1,
      t;
    if ((t = x >>> 16) != 0) {
      x = t;
      r += 16;
    }
    if ((t = x >> 8) != 0) {
      x = t;
      r += 8;
    }
    if ((t = x >> 4) != 0) {
      x = t;
      r += 4;
    }
    if ((t = x >> 2) != 0) {
      x = t;
      r += 2;
    }
    if ((t = x >> 1) != 0) {
      x = t;
      r += 1;
    }
    return r;
  };

  lShiftTo = (n: number, r: BigInteger): void => {
    const bs = n % this.DB;
    const cbs = this.DB - bs;
    const bm = (1 << cbs) - 1;
    const ds = Math.floor(n / this.DB);
    let c = (this.s << bs) & this.DM,
      i;
    for (i = this.t - 1; i >= 0; --i) {
      r[i + ds + 1] = (this[i] >> cbs) | c;
      c = (this[i] & bm) << bs;
    }
    for (i = ds - 1; i >= 0; --i) r[i] = 0;
    r[ds] = c;
    r.t = this.t + ds + 1;
    r.s = this.s;
    r.clamp();
  };

  dlShiftTo = (n: number, r: BigInteger): void => {
    let i;
    for (i = this.t - 1; i >= 0; --i) r[i + n] = this[i];
    for (i = n - 1; i >= 0; --i) r[i] = 0;
    r.t = this.t + n;
    r.s = this.s;
  };

  divRemTo = (m: BigInteger, q: BigInteger, r: BigInteger): void => {
    const pm = m.abs();
    if (pm.t <= 0) return;
    const pt = this.abs();
    if (pt.t < pm.t) {
      if (q != null) q.fromInt(0);
      if (r != null) this.copyTo(r);
      return;
    }
    if (r == null) r = nbi();
    const y = nbi(),
      ts = this.s,
      ms = m.s;
    const nsh = this.DB - this.nbits(pm[pm.t - 1]);
    if (nsh > 0) {
      pm.lShiftTo(nsh, y);
      pt.lShiftTo(nsh, r);
    } else {
      pm.copyTo(y);
      pt.copyTo(r);
    }
    const ys = y.t;
    const y0 = y[ys - 1];
    if (y0 == 0) return;
    const yt = y0 * (1 << this.#F1) + (ys > 1 ? y[ys - 2] >> this.#F2 : 0);
    const d1 = this.#FV / yt,
      d2 = (1 << this.#F1) / yt,
      e = 1 << this.#F2;
    const t = q == null ? nbi() : q;
    let i = r.t,
      j = i - ys;
    y.dlShiftTo(j, t);
    if (r.compareTo(t) >= 0) {
      r[r.t++] = 1;
      r.subTo(t, r);
    }
    BigInteger.ONE.dlShiftTo(ys, t);
    t.subTo(y, y);
    while (y.t < ys) y[y.t++] = 0;
    while (--j >= 0) {
      let qd =
        r[--i] == y0 ? this.DM : Math.floor(r[i] * d1 + (r[i - 1] + e) * d2);
      if ((r[i] += y.am(0, qd, r, j, 0, ys)) < qd) {
        y.dlShiftTo(j, t);
        r.subTo(t, r);
        while (r[i] < --qd) r.subTo(t, r);
      }
    }
    if (q != null) {
      r.drShiftTo(ys, q);
      if (ts != ms) BigInteger.ZERO.subTo(q, q);
    }
    r.t = ys;
    r.clamp();
    if (nsh > 0) r.rShiftTo(nsh, r);
    if (ts < 0) BigInteger.ZERO.subTo(r, r);
  };

  int2char = (n: number): string => {
    return this.#BI_RM.charAt(n);
  };

  rShiftTo = (n: number, r: BigInteger): void => {
    r.s = this.s;
    const ds = Math.floor(n / this.DB);
    if (ds >= this.t) {
      r.t = 0;
      return;
    }
    const bs = n % this.DB;
    const cbs = this.DB - bs;
    const bm = (1 << bs) - 1;
    r[0] = this[ds] >> bs;
    for (let i = ds + 1; i < this.t; ++i) {
      r[i - ds - 1] |= (this[i] & bm) << cbs;
      r[i - ds] = this[i] >> bs;
    }
    if (bs > 0) r[this.t - ds - 1] |= (this.s & bm) << cbs;
    r.t = this.t - ds;
    r.clamp();
  };

  squareTo = (r: BigInteger): void => {
    const x = this.abs();
    let i = (r.t = 2 * x.t);
    while (--i >= 0) r[i] = 0;
    for (i = 0; i < x.t - 1; ++i) {
      const c = x.am(i, x[i], r, 2 * i, 0, 1);
      if (
        (r[i + x.t] += x.am(i + 1, 2 * x[i], r, 2 * i + 1, c, x.t - i - 1)) >=
        x.DV
      ) {
        r[i + x.t] -= x.DV;
        r[i + x.t + 1] = 1;
      }
    }
    if (r.t > 0) r[r.t - 1] += x.am(i, x[i], r, 2 * i, 0, 1);
    r.s = 0;
    r.clamp();
  };

  modPow = (e: BigInteger, m: BigInteger): BigInteger => {
    const z = new Montgomery(m);
    let k,
      i = e.bitLength(),
      r = BigInteger.nbv(1);
    if (i <= 0) return r;
    else if (i < 18) k = 1;
    else if (i < 48) k = 3;
    else if (i < 144) k = 4;
    else if (i < 768) k = 5;
    else k = 6;

    const g = new Array(),
      k1 = k - 1,
      km = (1 << k) - 1;
    let n = 3;
    g[1] = z.convert(this);
    if (k > 1) {
      const g2 = nbi();
      z.sqrTo(g[1], g2);
      while (n <= km) {
        g[n] = nbi();
        z.mulTo(g2, g[n - 2], g[n]);
        n += 2;
      }
    }

    let r2 = nbi(),
      j = e.t - 1,
      is1 = true,
      w,
      t;
    i = this.nbits(e[j]) - 1;
    while (j >= 0) {
      if (i >= k1) w = (e[j] >> (i - k1)) & km;
      else {
        w = (e[j] & ((1 << (i + 1)) - 1)) << (k1 - i);
        if (j > 0) w |= e[j - 1] >> (this.DB + i - k1);
      }

      n = k;
      while ((w & 1) == 0) {
        w >>= 1;
        --n;
      }
      if ((i -= n) < 0) {
        i += this.DB;
        --j;
      }
      if (is1) {
        g[w].copyTo(r);
        is1 = false;
      } else {
        while (n > 1) {
          z.sqrTo(r, r2);
          z.sqrTo(r2, r);
          n -= 2;
        }
        if (n > 0) z.sqrTo(r, r2);
        else {
          t = r;
          r = r2;
          r2 = t;
        }
        z.mulTo(r2, g[w], r);
      }

      while (j >= 0 && (e[j] & (1 << i)) == 0) {
        z.sqrTo(r, r2);
        t = r;
        r = r2;
        r2 = t;
        if (--i < 0) {
          i = this.DB - 1;
          --j;
        }
      }
    }
    return z.revert(r);
  };

  drShiftTo = (n: number, r: BigInteger): void => {
    for (let i = n; i < this.t; ++i) r[i - n] = this[i];
    r.t = Math.max(this.t - n, 0);
    r.s = this.s;
  };

  multiplyTo = (a: BigInteger, r: BigInteger): void => {
    const x = this.abs(),
      y = a.abs();
    let i = x.t;
    r.t = i + y.t;
    while (--i >= 0) r[i] = 0;
    for (i = 0; i < y.t; ++i) r[i + x.t] = x.am(0, y[i], r, i, 0, x.t);
    r.s = 0;
    r.clamp();
    if (this.s != a.s) BigInteger.ZERO.subTo(r, r);
  };

  compareTo = (a: BigInteger): number => {
    let r = this.s - a.s;
    if (r != 0) return r;
    let i = this.t;
    r = i - a.t;
    if (r != 0) return this.s < 0 ? -r : r;
    while (--i >= 0) if ((r = this[i] - a[i]) != 0) return r;
    return 0;
  };

  fromInt = (x: number): void => {
    this.t = 1;
    this.s = x < 0 ? -1 : 0;
    if (x > 0) this[0] = x;
    else if (x < -1) this[0] = x + this.DV;
    else this.t = 0;
  };

  fromString = (s: string, b: number): void => {
    let k;
    if (b == 16) k = 4;
    else if (b == 8) k = 3;
    else if (b == 2) k = 1;
    else if (b == 32) k = 5;
    else if (b == 4) k = 2;
    else throw new Error('Only radix 2, 4, 8, 16, 32 are supported');
    this.t = 0;
    this.s = 0;
    let i = s.length,
      mi = false,
      sh = 0;
    while (--i >= 0) {
      const x = this.intAt(s, i);
      if (x < 0) {
        if (s.charAt(i) == '-') mi = true;
        continue;
      }
      mi = false;
      if (sh == 0) this[this.t++] = x;
      else if (sh + k > this.DB) {
        this[this.t - 1] |= (x & ((1 << (this.DB - sh)) - 1)) << sh;
        this[this.t++] = x >> (this.DB - sh);
      } else this[this.t - 1] |= x << sh;
      sh += k;
      if (sh >= this.DB) sh -= this.DB;
    }
    this.clamp();
    if (mi) BigInteger.ZERO.subTo(this, this);
  };

  bitLength = (): number => {
    if (this.t <= 0) return 0;
    return (
      this.DB * (this.t - 1) + this.nbits(this[this.t - 1] ^ (this.s & this.DM))
    );
  };

  toString = (b: number): string => {
    if (this.s < 0) return '-' + this.negate().toString(b);
    let k;
    if (b == 16) k = 4;
    else if (b == 8) k = 3;
    else if (b == 2) k = 1;
    else if (b == 32) k = 5;
    else if (b == 4) k = 2;
    else throw new Error('Only radix 2, 4, 8, 16, 32 are supported');
    const km = (1 << k) - 1;
    let i = this.t,
      m = false,
      r = '',
      d;
    let p = this.DB - ((i * this.DB) % k);
    if (i-- > 0) {
      if (p < this.DB && (d = this[i] >> p) > 0) {
        m = true;
        r = this.int2char(d);
      }
      while (i >= 0) {
        if (p < k) {
          d = (this[i] & ((1 << p) - 1)) << (k - p);
          d |= this[--i] >> (p += this.DB - k);
        } else {
          d = (this[i] >> (p -= k)) & km;
          if (p <= 0) {
            p += this.DB;
            --i;
          }
        }
        if (d > 0) m = true;
        if (m) r += this.int2char(d);
      }
    }
    return m ? r : '0';
  };

  addTo = (a: BigInteger, r: BigInteger): void => {
    let i = 0,
      c = 0;
    const m = Math.min(a.t, this.t);
    while (i < m) {
      c += this[i] + a[i];
      r[i++] = c & this.DM;
      c >>= this.DB;
    }
    if (a.t < this.t) {
      c += a.s;
      while (i < this.t) {
        c += this[i];
        r[i++] = c & this.DM;
        c >>= this.DB;
      }
      c += this.s;
    } else {
      c += this.s;
      while (i < a.t) {
        c += a[i];
        r[i++] = c & this.DM;
        c >>= this.DB;
      }
      c += a.s;
    }
    r.s = c < 0 ? -1 : 0;
    if (c > 0) r[i++] = c;
    else if (c < -1) r[i++] = this.DV + c;
    r.t = i;
    r.clamp();
  };
}

class Montgomery {
  #m: BigInteger;
  #mp: number;
  #mpl: number;
  #mph: number;
  #um: number;
  #mt2: number;

  constructor(m: BigInteger) {
    this.#m = m;
    this.#mp = m.invDigit();
    this.#mpl = this.#mp & 0x7fff;
    this.#mph = this.#mp >> 15;
    this.#um = (1 << (m.DB - 15)) - 1;
    this.#mt2 = 2 * m.t;
  }

  reduce = (x: BigInteger): void => {
    while (x.t <= this.#mt2) x[x.t++] = 0;
    for (let i = 0; i < this.#m.t; ++i) {
      let j = x[i] & 0x7fff;
      const u0 =
        (j * this.#mpl +
          (((j * this.#mph + (x[i] >> 15) * this.#mpl) & this.#um) << 15)) &
        x.DM;
      j = i + this.#m.t;
      x[j] += this.#m.am(0, u0, x, i, 0, this.#m.t);
      while (x[j] >= x.DV) {
        x[j] -= x.DV;
        x[++j]++;
      }
    }
    x.clamp();
    x.drShiftTo(this.#m.t, x);
    if (x.compareTo(this.#m) >= 0) x.subTo(this.#m, x);
  };

  sqrTo = (x: BigInteger, r: BigInteger): void => {
    x.squareTo(r);

    this.reduce(r);
  };

  mulTo = (x: BigInteger, y: BigInteger, r: BigInteger): void => {
    x.multiplyTo(y, r);

    this.reduce(r);
  };

  revert = (x: BigInteger): BigInteger => {
    const r = nbi();
    x.copyTo(r);
    this.reduce(r);
    return r;
  };

  convert = (x: BigInteger): BigInteger => {
    const r = nbi();
    x.abs().dlShiftTo(this.#m.t, r);
    r.divRemTo(this.#m, null, r);
    if (x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) this.#m.subTo(r, r);
    return r;
  };
}
