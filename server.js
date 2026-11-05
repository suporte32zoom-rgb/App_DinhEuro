var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/dotenv/lib/main.js
var require_main = __commonJS({
  "node_modules/dotenv/lib/main.js"(exports, module) {
    var fs = __require("fs");
    var path2 = __require("path");
    var os = __require("os");
    var crypto = __require("crypto");
    var TIPS = [
      "\u25C8 encrypted .env [www.dotenvx.com]",
      "\u25C8 secrets for agents [www.dotenvx.com]",
      "\u2301 auth for agents [www.vestauth.com]",
      "\u2318 custom filepath { path: '/custom/path/.env' }",
      "\u2318 enable debugging { debug: true }",
      "\u2318 override existing { override: true }",
      "\u2318 suppress logs { quiet: true }",
      "\u2318 multiple files { path: ['.env.local', '.env'] }"
    ];
    function _getRandomTip() {
      return TIPS[Math.floor(Math.random() * TIPS.length)];
    }
    function parseBoolean(value) {
      if (typeof value === "string") {
        return !["false", "0", "no", "off", ""].includes(value.toLowerCase());
      }
      return Boolean(value);
    }
    function supportsAnsi() {
      return process.stdout.isTTY;
    }
    function dim(text) {
      return supportsAnsi() ? `\x1B[2m${text}\x1B[0m` : text;
    }
    var LINE = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;
    function parse(src) {
      const obj = {};
      let lines = src.toString();
      lines = lines.replace(/\r\n?/mg, "\n");
      let match;
      while ((match = LINE.exec(lines)) != null) {
        const key = match[1];
        let value = match[2] || "";
        value = value.trim();
        const maybeQuote = value[0];
        value = value.replace(/^(['"`])([\s\S]*)\1$/mg, "$2");
        if (maybeQuote === '"') {
          value = value.replace(/\\n/g, "\n");
          value = value.replace(/\\r/g, "\r");
        }
        obj[key] = value;
      }
      return obj;
    }
    function _parseVault(options) {
      options = options || {};
      const vaultPath = _vaultPath(options);
      options.path = vaultPath;
      const result = DotenvModule.configDotenv(options);
      if (!result.parsed) {
        const err = new Error(`MISSING_DATA: Cannot parse ${vaultPath} for an unknown reason`);
        err.code = "MISSING_DATA";
        throw err;
      }
      const keys = _dotenvKey(options).split(",");
      const length = keys.length;
      let decrypted;
      for (let i = 0; i < length; i++) {
        try {
          const key = keys[i].trim();
          const attrs = _instructions(result, key);
          decrypted = DotenvModule.decrypt(attrs.ciphertext, attrs.key);
          break;
        } catch (error) {
          if (i + 1 >= length) {
            throw error;
          }
        }
      }
      return DotenvModule.parse(decrypted);
    }
    function _warn(message) {
      console.error(`\u26A0 ${message}`);
    }
    function _debug(message) {
      console.log(`\u2506 ${message}`);
    }
    function _log(message) {
      console.log(`\u25C7 ${message}`);
    }
    function _dotenvKey(options) {
      if (options && options.DOTENV_KEY && options.DOTENV_KEY.length > 0) {
        return options.DOTENV_KEY;
      }
      if (process.env.DOTENV_KEY && process.env.DOTENV_KEY.length > 0) {
        return process.env.DOTENV_KEY;
      }
      return "";
    }
    function _instructions(result, dotenvKey) {
      let uri;
      try {
        uri = new URL(dotenvKey);
      } catch (error) {
        if (error.code === "ERR_INVALID_URL") {
          const err = new Error("INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=development");
          err.code = "INVALID_DOTENV_KEY";
          throw err;
        }
        throw error;
      }
      const key = uri.password;
      if (!key) {
        const err = new Error("INVALID_DOTENV_KEY: Missing key part");
        err.code = "INVALID_DOTENV_KEY";
        throw err;
      }
      const environment = uri.searchParams.get("environment");
      if (!environment) {
        const err = new Error("INVALID_DOTENV_KEY: Missing environment part");
        err.code = "INVALID_DOTENV_KEY";
        throw err;
      }
      const environmentKey = `DOTENV_VAULT_${environment.toUpperCase()}`;
      const ciphertext = result.parsed[environmentKey];
      if (!ciphertext) {
        const err = new Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${environmentKey} in your .env.vault file.`);
        err.code = "NOT_FOUND_DOTENV_ENVIRONMENT";
        throw err;
      }
      return { ciphertext, key };
    }
    function _vaultPath(options) {
      let possibleVaultPath = null;
      if (options && options.path && options.path.length > 0) {
        if (Array.isArray(options.path)) {
          for (const filepath of options.path) {
            if (fs.existsSync(filepath)) {
              possibleVaultPath = filepath.endsWith(".vault") ? filepath : `${filepath}.vault`;
            }
          }
        } else {
          possibleVaultPath = options.path.endsWith(".vault") ? options.path : `${options.path}.vault`;
        }
      } else {
        possibleVaultPath = path2.resolve(process.cwd(), ".env.vault");
      }
      if (fs.existsSync(possibleVaultPath)) {
        return possibleVaultPath;
      }
      return null;
    }
    function _resolveHome(envPath) {
      return envPath[0] === "~" ? path2.join(os.homedir(), envPath.slice(1)) : envPath;
    }
    function _configVault(options) {
      const debug = parseBoolean(process.env.DOTENV_CONFIG_DEBUG || options && options.debug);
      const quiet = parseBoolean(process.env.DOTENV_CONFIG_QUIET || options && options.quiet);
      if (debug || !quiet) {
        _log("loading env from encrypted .env.vault");
      }
      const parsed = DotenvModule._parseVault(options);
      let processEnv = process.env;
      if (options && options.processEnv != null) {
        processEnv = options.processEnv;
      }
      DotenvModule.populate(processEnv, parsed, options);
      return { parsed };
    }
    function configDotenv(options) {
      const dotenvPath = path2.resolve(process.cwd(), ".env");
      let encoding = "utf8";
      let processEnv = process.env;
      if (options && options.processEnv != null) {
        processEnv = options.processEnv;
      }
      let debug = parseBoolean(processEnv.DOTENV_CONFIG_DEBUG || options && options.debug);
      let quiet = parseBoolean(processEnv.DOTENV_CONFIG_QUIET || options && options.quiet);
      if (options && options.encoding) {
        encoding = options.encoding;
      } else {
        if (debug) {
          _debug("no encoding is specified (UTF-8 is used by default)");
        }
      }
      let optionPaths = [dotenvPath];
      if (options && options.path) {
        if (!Array.isArray(options.path)) {
          optionPaths = [_resolveHome(options.path)];
        } else {
          optionPaths = [];
          for (const filepath of options.path) {
            optionPaths.push(_resolveHome(filepath));
          }
        }
      }
      let lastError;
      const parsedAll = {};
      for (const path3 of optionPaths) {
        try {
          const parsed = DotenvModule.parse(fs.readFileSync(path3, { encoding }));
          DotenvModule.populate(parsedAll, parsed, options);
        } catch (e) {
          if (debug) {
            _debug(`failed to load ${path3} ${e.message}`);
          }
          lastError = e;
        }
      }
      const populated = DotenvModule.populate(processEnv, parsedAll, options);
      debug = parseBoolean(processEnv.DOTENV_CONFIG_DEBUG || debug);
      quiet = parseBoolean(processEnv.DOTENV_CONFIG_QUIET || quiet);
      if (debug || !quiet) {
        const keysCount = Object.keys(populated).length;
        const shortPaths = [];
        for (const filePath of optionPaths) {
          try {
            const relative = path2.relative(process.cwd(), filePath);
            shortPaths.push(relative);
          } catch (e) {
            if (debug) {
              _debug(`failed to load ${filePath} ${e.message}`);
            }
            lastError = e;
          }
        }
        _log(`injected env (${keysCount}) from ${shortPaths.join(",")} ${dim(`// tip: ${_getRandomTip()}`)}`);
      }
      if (lastError) {
        return { parsed: parsedAll, error: lastError };
      } else {
        return { parsed: parsedAll };
      }
    }
    function config(options) {
      if (_dotenvKey(options).length === 0) {
        return DotenvModule.configDotenv(options);
      }
      const vaultPath = _vaultPath(options);
      if (!vaultPath) {
        _warn(`you set DOTENV_KEY but you are missing a .env.vault file at ${vaultPath}`);
        return DotenvModule.configDotenv(options);
      }
      return DotenvModule._configVault(options);
    }
    function decrypt(encrypted, keyStr) {
      const key = Buffer.from(keyStr.slice(-64), "hex");
      let ciphertext = Buffer.from(encrypted, "base64");
      const nonce = ciphertext.subarray(0, 12);
      const authTag = ciphertext.subarray(-16);
      ciphertext = ciphertext.subarray(12, -16);
      try {
        const aesgcm = crypto.createDecipheriv("aes-256-gcm", key, nonce);
        aesgcm.setAuthTag(authTag);
        return `${aesgcm.update(ciphertext)}${aesgcm.final()}`;
      } catch (error) {
        const isRange = error instanceof RangeError;
        const invalidKeyLength = error.message === "Invalid key length";
        const decryptionFailed = error.message === "Unsupported state or unable to authenticate data";
        if (isRange || invalidKeyLength) {
          const err = new Error("INVALID_DOTENV_KEY: It must be 64 characters long (or more)");
          err.code = "INVALID_DOTENV_KEY";
          throw err;
        } else if (decryptionFailed) {
          const err = new Error("DECRYPTION_FAILED: Please check your DOTENV_KEY");
          err.code = "DECRYPTION_FAILED";
          throw err;
        } else {
          throw error;
        }
      }
    }
    function populate(processEnv, parsed, options = {}) {
      const debug = Boolean(options && options.debug);
      const override = Boolean(options && options.override);
      const populated = {};
      if (typeof parsed !== "object") {
        const err = new Error("OBJECT_REQUIRED: Please check the processEnv argument being passed to populate");
        err.code = "OBJECT_REQUIRED";
        throw err;
      }
      for (const key of Object.keys(parsed)) {
        if (Object.prototype.hasOwnProperty.call(processEnv, key)) {
          if (override === true) {
            processEnv[key] = parsed[key];
            populated[key] = parsed[key];
          }
          if (debug) {
            if (override === true) {
              _debug(`"${key}" is already defined and WAS overwritten`);
            } else {
              _debug(`"${key}" is already defined and was NOT overwritten`);
            }
          }
        } else {
          processEnv[key] = parsed[key];
          populated[key] = parsed[key];
        }
      }
      return populated;
    }
    var DotenvModule = {
      configDotenv,
      _configVault,
      _parseVault,
      config,
      decrypt,
      parse,
      populate
    };
    module.exports.configDotenv = DotenvModule.configDotenv;
    module.exports._configVault = DotenvModule._configVault;
    module.exports._parseVault = DotenvModule._parseVault;
    module.exports.config = DotenvModule.config;
    module.exports.decrypt = DotenvModule.decrypt;
    module.exports.parse = DotenvModule.parse;
    module.exports.populate = DotenvModule.populate;
    module.exports = DotenvModule;
  }
});

// server.ts
var import_dotenv = __toESM(require_main(), 1);
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

// src/server/marketProxy.ts
var cachedData = null;
var lastCacheTime = 0;
var isRefreshing = false;
var CACHE_TTL_MS = 6e3;
var webhookQuoteOverrides = {};
var YAHOO_SYMBOLS_MAP = {
  // 1. World Indices (14)
  "S&P 500": { yahoo: "%5EGSPC", name: "Standard & Poor's 500", category: "indices", currency: "USD", flag: "\u{1F1FA}\u{1F1F8}" },
  "NASDAQ": { yahoo: "%5EIXIC", name: "Nasdaq Composite", category: "indices", currency: "USD", flag: "\u{1F1FA}\u{1F1F8}" },
  "DOW JONES": { yahoo: "%5EDJI", name: "Dow Jones Industrial Average", category: "indices", currency: "USD", flag: "\u{1F1FA}\u{1F1F8}" },
  "IBOVESPA": { yahoo: "%5EBVSP", name: "\xCDndice Bovespa (Brasil B3)", category: "indices", currency: "BRL", flag: "\u{1F1E7}\u{1F1F7}" },
  "DAX 40": { yahoo: "%5EGDAXI", name: "Frankfurt DAX 40", category: "indices", currency: "EUR", flag: "\u{1F1E9}\u{1F1EA}" },
  "FTSE 100": { yahoo: "%5EFTSE", name: "London FTSE 100", category: "indices", currency: "GBP", flag: "\u{1F1EC}\u{1F1E7}" },
  "NIKKEI 225": { yahoo: "%5EN225", name: "Tokyo Nikkei 225", category: "indices", currency: "JPY", flag: "\u{1F1EF}\u{1F1F5}" },
  "HANG SENG": { yahoo: "%5EHSI", name: "Hong Kong Hang Seng", category: "indices", currency: "HKD", flag: "\u{1F1ED}\u{1F1F0}" },
  "CAC 40": { yahoo: "%5EFCHI", name: "Paris CAC 40", category: "indices", currency: "EUR", flag: "\u{1F1EB}\u{1F1F7}" },
  "EURO STOXX 50": { yahoo: "%5ESTOXX50E", name: "Euro Stoxx 50 Index", category: "indices", currency: "EUR", flag: "\u{1F1EA}\u{1F1FA}" },
  "SHANGHAI COMPOSITE": { yahoo: "000001.SS", name: "Shanghai Composite", category: "indices", currency: "CNY", flag: "\u{1F1E8}\u{1F1F3}" },
  "ASX 200": { yahoo: "%5EAXJO", name: "S&P/ASX 200 Austr\xE1lia", category: "indices", currency: "AUD", flag: "\u{1F1E6}\u{1F1FA}" },
  "RUSSELL 2000": { yahoo: "%5ERUT", name: "Russell 2000 Small-Caps", category: "indices", currency: "USD", flag: "\u{1F1FA}\u{1F1F8}" },
  "VIX": { yahoo: "%5EVIX", name: "CBOE Volatility Index", category: "indices", currency: "USD", flag: "\u{1F4C9}" },
  // 2. US Equities (25)
  "AAPL": { yahoo: "AAPL", name: "Apple Inc.", category: "stocks_us", currency: "USD", flag: "\u{1F1FA}\u{1F1F8}" },
  "MSFT": { yahoo: "MSFT", name: "Microsoft Corporation", category: "stocks_us", currency: "USD", flag: "\u{1F1FA}\u{1F1F8}" },
  "NVDA": { yahoo: "NVDA", name: "NVIDIA Corporation", category: "stocks_us", currency: "USD", flag: "\u{1F1FA}\u{1F1F8}" },
  "AMZN": { yahoo: "AMZN", name: "Amazon.com Inc.", category: "stocks_us", currency: "USD", flag: "\u{1F1FA}\u{1F1F8}" },
  "GOOGL": { yahoo: "GOOGL", name: "Alphabet Inc. (Google)", category: "stocks_us", currency: "USD", flag: "\u{1F1FA}\u{1F1F8}" },
  "META": { yahoo: "META", name: "Meta Platforms Inc.", category: "stocks_us", currency: "USD", flag: "\u{1F1FA}\u{1F1F8}" },
  "TSLA": { yahoo: "TSLA", name: "Tesla Inc.", category: "stocks_us", currency: "USD", flag: "\u{1F1FA}\u{1F1F8}" },
  "BRK.B": { yahoo: "BRK-B", name: "Berkshire Hathaway Inc.", category: "stocks_us", currency: "USD", flag: "\u{1F1FA}\u{1F1F8}" },
  "AVGO": { yahoo: "AVGO", name: "Broadcom Inc.", category: "stocks_us", currency: "USD", flag: "\u{1F1FA}\u{1F1F8}" },
  "JPM": { yahoo: "JPM", name: "JPMorgan Chase & Co.", category: "stocks_us", currency: "USD", flag: "\u{1F1FA}\u{1F1F8}" },
  "LLY": { yahoo: "LLY", name: "Eli Lilly and Company", category: "stocks_us", currency: "USD", flag: "\u{1F1FA}\u{1F1F8}" },
  "V": { yahoo: "V", name: "Visa Inc.", category: "stocks_us", currency: "USD", flag: "\u{1F1FA}\u{1F1F8}" },
  "WMT": { yahoo: "WMT", name: "Walmart Inc.", category: "stocks_us", currency: "USD", flag: "\u{1F1FA}\u{1F1F8}" },
  "UNH": { yahoo: "UNH", name: "UnitedHealth Group", category: "stocks_us", currency: "USD", flag: "\u{1F1FA}\u{1F1F8}" },
  "MA": { yahoo: "MA", name: "Mastercard Incorporated", category: "stocks_us", currency: "USD", flag: "\u{1F1FA}\u{1F1F8}" },
  "AMD": { yahoo: "AMD", name: "Advanced Micro Devices", category: "stocks_us", currency: "USD", flag: "\u{1F1FA}\u{1F1F8}" },
  "NFLX": { yahoo: "NFLX", name: "Netflix Inc.", category: "stocks_us", currency: "USD", flag: "\u{1F1FA}\u{1F1F8}" },
  "INTC": { yahoo: "INTC", name: "Intel Corporation", category: "stocks_us", currency: "USD", flag: "\u{1F1FA}\u{1F1F8}" },
  "CRM": { yahoo: "CRM", name: "Salesforce Inc.", category: "stocks_us", currency: "USD", flag: "\u{1F1FA}\u{1F1F8}" },
  "ORCL": { yahoo: "ORCL", name: "Oracle Corporation", category: "stocks_us", currency: "USD", flag: "\u{1F1FA}\u{1F1F8}" },
  "COST": { yahoo: "COST", name: "Costco Wholesale", category: "stocks_us", currency: "USD", flag: "\u{1F1FA}\u{1F1F8}" },
  "PG": { yahoo: "PG", name: "Procter & Gamble Co.", category: "stocks_us", currency: "USD", flag: "\u{1F1FA}\u{1F1F8}" },
  "DIS": { yahoo: "DIS", name: "Walt Disney Company", category: "stocks_us", currency: "USD", flag: "\u{1F1FA}\u{1F1F8}" },
  "ADBE": { yahoo: "ADBE", name: "Adobe Inc.", category: "stocks_us", currency: "USD", flag: "\u{1F1FA}\u{1F1F8}" },
  "PYPL": { yahoo: "PYPL", name: "PayPal Holdings Inc.", category: "stocks_us", currency: "USD", flag: "\u{1F1FA}\u{1F1F8}" },
  // 3. Brazilian Equities - B3 (25)
  "PETR4": { yahoo: "PETR4.SA", name: "Petrobras PN", category: "stocks_br", currency: "BRL", flag: "\u{1F1E7}\u{1F1F7}" },
  "VALE3": { yahoo: "VALE3.SA", name: "Vale ON", category: "stocks_br", currency: "BRL", flag: "\u{1F1E7}\u{1F1F7}" },
  "ITUB4": { yahoo: "ITUB4.SA", name: "Ita\xFA Unibanco PN", category: "stocks_br", currency: "BRL", flag: "\u{1F1E7}\u{1F1F7}" },
  "BBDC4": { yahoo: "BBDC4.SA", name: "Banco Bradesco PN", category: "stocks_br", currency: "BRL", flag: "\u{1F1E7}\u{1F1F7}" },
  "BBAS3": { yahoo: "BBAS3.SA", name: "Banco do Brasil ON", category: "stocks_br", currency: "BRL", flag: "\u{1F1E7}\u{1F1F7}" },
  "WEGE3": { yahoo: "WEGE3.SA", name: "WEG S.A. ON", category: "stocks_br", currency: "BRL", flag: "\u{1F1E7}\u{1F1F7}" },
  "MGLU3": { yahoo: "MGLU3.SA", name: "Magazine Luiza ON", category: "stocks_br", currency: "BRL", flag: "\u{1F1E7}\u{1F1F7}" },
  "ABEV3": { yahoo: "ABEV3.SA", name: "Ambev S.A. ON", category: "stocks_br", currency: "BRL", flag: "\u{1F1E7}\u{1F1F7}" },
  "RENT3": { yahoo: "RENT3.SA", name: "Localiza Rent a Car", category: "stocks_br", currency: "BRL", flag: "\u{1F1E7}\u{1F1F7}" },
  "B3SA3": { yahoo: "B3SA3.SA", name: "B3 S.A. Brasil Bolsa", category: "stocks_br", currency: "BRL", flag: "\u{1F1E7}\u{1F1F7}" },
  "PRIO3": { yahoo: "PRIO3.SA", name: "PRIO S.A. (PetroRio)", category: "stocks_br", currency: "BRL", flag: "\u{1F1E7}\u{1F1F7}" },
  "RADL3": { yahoo: "RADL3.SA", name: "RaiaDrogasil ON", category: "stocks_br", currency: "BRL", flag: "\u{1F1E7}\u{1F1F7}" },
  "SUZB3": { yahoo: "SUZB3.SA", name: "Suzano Papel e Celulose", category: "stocks_br", currency: "BRL", flag: "\u{1F1E7}\u{1F1F7}" },
  "GGBR4": { yahoo: "GGBR4.SA", name: "Gerdau S.A. PN", category: "stocks_br", currency: "BRL", flag: "\u{1F1E7}\u{1F1F7}" },
  "CSNA3": { yahoo: "CSNA3.SA", name: "Companhia Sider\xFArgica Nacional", category: "stocks_br", currency: "BRL", flag: "\u{1F1E7}\u{1F1F7}" },
  "UGPA3": { yahoo: "UGPA3.SA", name: "Ultrapar Participa\xE7\xF5es", category: "stocks_br", currency: "BRL", flag: "\u{1F1E7}\u{1F1F7}" },
  "TIMS3": { yahoo: "TIMS3.SA", name: "TIM S.A. ON", category: "stocks_br", currency: "BRL", flag: "\u{1F1E7}\u{1F1F7}" },
  "ASAI3": { yahoo: "ASAI3.SA", name: "Assa\xED Atacadista ON", category: "stocks_br", currency: "BRL", flag: "\u{1F1E7}\u{1F1F7}" },
  "HAPV3": { yahoo: "HAPV3.SA", name: "Hapvida Participa\xE7\xF5es", category: "stocks_br", currency: "BRL", flag: "\u{1F1E7}\u{1F1F7}" },
  "LREN3": { yahoo: "LREN3.SA", name: "Lojas Renner ON", category: "stocks_br", currency: "BRL", flag: "\u{1F1E7}\u{1F1F7}" },
  "EQTL3": { yahoo: "EQTL3.SA", name: "Equatorial Energia ON", category: "stocks_br", currency: "BRL", flag: "\u{1F1E7}\u{1F1F7}" },
  "VBBR3": { yahoo: "VBBR3.SA", name: "Vibra Energia ON", category: "stocks_br", currency: "BRL", flag: "\u{1F1E7}\u{1F1F7}" },
  "KLBN11": { yahoo: "KLBN11.SA", name: "Klabin S.A. Unit", category: "stocks_br", currency: "BRL", flag: "\u{1F1E7}\u{1F1F7}" },
  "SANB11": { yahoo: "SANB11.SA", name: "Banco Santander Brasil Unit", category: "stocks_br", currency: "BRL", flag: "\u{1F1E7}\u{1F1F7}" },
  "CMIG4": { yahoo: "CMIG4.SA", name: "Companhia Energ\xE9tica de Minas Gerais", category: "stocks_br", currency: "BRL", flag: "\u{1F1E7}\u{1F1F7}" },
  // 4. Commodities Globais (11)
  "OURO (XAU)": { yahoo: "GC=F", name: "Ouro Spot / On\xE7a Troy", category: "commodities", currency: "USD", flag: "\u{1F947}" },
  "PRATA (XAG)": { yahoo: "SI=F", name: "Prata Spot / On\xE7a Troy", category: "commodities", currency: "USD", flag: "\u{1F948}" },
  "BRENT": { yahoo: "BZ=F", name: "Petr\xF3leo Brent Contrato Futuro", category: "commodities", currency: "USD", flag: "\u{1F6E2}\uFE0F" },
  "WTI": { yahoo: "CL=F", name: "Petr\xF3leo WTI (Texas)", category: "commodities", currency: "USD", flag: "\u{1F6E2}\uFE0F" },
  "G\xC1S NATURAL": { yahoo: "NG=F", name: "G\xE1s Natural Henry Hub", category: "commodities", currency: "USD", flag: "\u{1F525}" },
  "COBRE": { yahoo: "HG=F", name: "Cobre Contrato Futuro", category: "commodities", currency: "USD", flag: "\u{1F9F1}" },
  "PLATINA": { yahoo: "PL=F", name: "Platina Spot / On\xE7a Troy", category: "commodities", currency: "USD", flag: "\u2728" },
  "TRIGO": { yahoo: "ZW=F", name: "Trigo Chicago Board", category: "commodities", currency: "USD", flag: "\u{1F33E}" },
  "MILHO": { yahoo: "ZC=F", name: "Milho Chicago Board", category: "commodities", currency: "USD", flag: "\u{1F33D}" },
  "SOJA": { yahoo: "ZS=F", name: "Soja Chicago Board", category: "commodities", currency: "USD", flag: "\u{1F331}" },
  "CAF\xC9": { yahoo: "KC=F", name: "Caf\xE9 Ar\xE1bica NY", category: "commodities", currency: "USD", flag: "\u2615" },
  // 5. Câmbio & Forex (15)
  "USD/BRL": { yahoo: "BRL=X", name: "D\xF3lar Americano / Real", category: "forex", currency: "BRL", flag: "\u{1F1FA}\u{1F1F8}" },
  "EUR/BRL": { yahoo: "EURBRL=X", name: "Euro / Real Brasileiro", category: "forex", currency: "BRL", flag: "\u{1F1EA}\u{1F1FA}" },
  "GBP/BRL": { yahoo: "GBPBRL=X", name: "Libra Esterlina / Real", category: "forex", currency: "BRL", flag: "\u{1F1EC}\u{1F1E7}" },
  "CHF/BRL": { yahoo: "CHFBRL=X", name: "Franco Su\xED\xE7o / Real", category: "forex", currency: "BRL", flag: "\u{1F1E8}\u{1F1ED}" },
  "JPY/BRL": { yahoo: "JPYBRL=X", name: "Iene Japon\xEAs / Real", category: "forex", currency: "BRL", flag: "\u{1F1EF}\u{1F1F5}" },
  "CAD/BRL": { yahoo: "CADBRL=X", name: "D\xF3lar Canadense / Real", category: "forex", currency: "BRL", flag: "\u{1F1E8}\u{1F1E6}" },
  "AUD/BRL": { yahoo: "AUDBRL=X", name: "D\xF3lar Australiano / Real", category: "forex", currency: "BRL", flag: "\u{1F1E6}\u{1F1FA}" },
  "CNY/BRL": { yahoo: "CNYBRL=X", name: "Yuan Chin\xEAs / Real", category: "forex", currency: "BRL", flag: "\u{1F1E8}\u{1F1F3}" },
  "ARS/BRL": { yahoo: "ARSBRL=X", name: "Peso Argentino / Real", category: "forex", currency: "BRL", flag: "\u{1F1E6}\u{1F1F7}" },
  "EUR/USD": { yahoo: "EURUSD=X", name: "Euro / D\xF3lar Americano", category: "forex", currency: "USD", flag: "\u{1F1EA}\u{1F1FA}" },
  "GBP/USD": { yahoo: "GBPUSD=X", name: "Libra / D\xF3lar Americano", category: "forex", currency: "USD", flag: "\u{1F1EC}\u{1F1E7}" },
  "USD/JPY": { yahoo: "USDJPY=X", name: "D\xF3lar Americano / Iene Japon\xEAs", category: "forex", currency: "JPY", flag: "\u{1F1EF}\u{1F1F5}" },
  "USD/CHF": { yahoo: "USDCHF=X", name: "D\xF3lar Americano / Franco Su\xED\xE7o", category: "forex", currency: "CHF", flag: "\u{1F1E8}\u{1F1ED}" },
  "AUD/USD": { yahoo: "AUDUSD=X", name: "D\xF3lar Australiano / D\xF3lar Americano", category: "forex", currency: "USD", flag: "\u{1F1E6}\u{1F1FA}" },
  "USD/CAD": { yahoo: "USDCAD=X", name: "D\xF3lar Americano / D\xF3lar Canadense", category: "forex", currency: "CAD", flag: "\u{1F1E8}\u{1F1E6}" }
};
var CRYPTO_LIST = [
  { id: "BTC/USD", symbol: "BTC/USD", name: "Bitcoin", pairUsd: "BTC-USD", cgId: "bitcoin", flag: "\u{1F310}" },
  { id: "ETH/USD", symbol: "ETH/USD", name: "Ethereum", pairUsd: "ETH-USD", cgId: "ethereum", flag: "\u{1F310}" },
  { id: "SOL/USD", symbol: "SOL/USD", name: "Solana", pairUsd: "SOL-USD", cgId: "solana", flag: "\u{1F310}" },
  { id: "BNB/USD", symbol: "BNB/USD", name: "BNB (Binance)", pairUsd: "BNB-USD", cgId: "binancecoin", flag: "\u{1F310}" },
  { id: "XRP/USD", symbol: "XRP/USD", name: "Ripple (XRP)", pairUsd: "XRP-USD", cgId: "ripple", flag: "\u{1F310}" },
  { id: "ADA/USD", symbol: "ADA/USD", name: "Cardano (ADA)", pairUsd: "ADA-USD", cgId: "cardano", flag: "\u{1F310}" },
  { id: "DOGE/USD", symbol: "DOGE/USD", name: "Dogecoin", pairUsd: "DOGE-USD", cgId: "dogecoin", flag: "\u{1F310}" },
  { id: "AVAX/USD", symbol: "AVAX/USD", name: "Avalanche", pairUsd: "AVAX-USD", cgId: "avalanche-2", flag: "\u{1F310}" },
  { id: "DOT/USD", symbol: "DOT/USD", name: "Polkadot", pairUsd: "DOT-USD", cgId: "polkadot", flag: "\u{1F310}" },
  { id: "LINK/USD", symbol: "LINK/USD", name: "Chainlink", pairUsd: "LINK-USD", cgId: "chainlink", flag: "\u{1F310}" },
  { id: "LTC/USD", symbol: "LTC/USD", name: "Litecoin", pairUsd: "LTC-USD", cgId: "litecoin", flag: "\u{1F310}" },
  { id: "NEAR/USD", symbol: "NEAR/USD", name: "NEAR Protocol", pairUsd: "NEAR-USD", cgId: "near", flag: "\u{1F310}" },
  { id: "SUI/USD", symbol: "SUI/USD", name: "Sui Network", pairUsd: "SUI-USD", cgId: "sui", flag: "\u{1F310}" },
  { id: "APT/USD", symbol: "APT/USD", name: "Aptos", pairUsd: "APT-USD", cgId: "aptos", flag: "\u{1F310}" }
];
async function getAggregatedMarketData() {
  const now = Date.now();
  if (cachedData && now - lastCacheTime < CACHE_TTL_MS) {
    return cachedData;
  }
  if (isRefreshing && cachedData) {
    return cachedData;
  }
  isRefreshing = true;
  try {
    const finnhubKey = process.env.FINNHUB_API_KEY || "";
    const fmpKey = process.env.FMP_API_KEY || "";
    const sourcesStatus = {
      yahooFinance: false,
      coinbase: false,
      coingecko: false,
      ecb: false,
      finnhub: false,
      fmp: false
    };
    const rates = {
      USD: 1,
      BRL: 5.459,
      EUR: 0.8905,
      GBP: 0.7423,
      JPY: 158.45,
      CHF: 0.8168,
      CAD: 1.3968,
      AUD: 1.4271,
      CNY: 6.6738,
      BTC: 1247e-8,
      ETH: 4128e-7,
      SOL: 0.01054
    };
    const pairs = {};
    const quotes = {};
    try {
      const frankRes = await fetch("https://api.frankfurter.dev/v1/latest?base=USD");
      if (frankRes.ok) {
        const frankData = await frankRes.json();
        if (frankData && frankData.rates) {
          sourcesStatus.ecb = true;
          if (frankData.rates.BRL) rates.BRL = Number(frankData.rates.BRL);
          if (frankData.rates.EUR) rates.EUR = Number(frankData.rates.EUR);
          if (frankData.rates.GBP) rates.GBP = Number(frankData.rates.GBP);
          if (frankData.rates.JPY) rates.JPY = Number(frankData.rates.JPY);
          if (frankData.rates.CHF) rates.CHF = Number(frankData.rates.CHF);
          if (frankData.rates.CAD) rates.CAD = Number(frankData.rates.CAD);
          if (frankData.rates.AUD) rates.AUD = Number(frankData.rates.AUD);
          if (frankData.rates.CNY) rates.CNY = Number(frankData.rates.CNY);
        }
      }
    } catch {
    }
    try {
      const cbRes = await fetch("https://api.coinbase.com/v2/exchange-rates?currency=USD", {
        headers: { "User-Agent": "DinhEuro/2.0" }
      });
      if (cbRes.ok) {
        const cbData = await cbRes.json();
        if (cbData?.data?.rates) {
          sourcesStatus.coinbase = true;
          const r = cbData.data.rates;
          if (r.BRL) rates.BRL = parseFloat(r.BRL) || rates.BRL;
          if (r.EUR) rates.EUR = parseFloat(r.EUR) || rates.EUR;
          if (r.GBP) rates.GBP = parseFloat(r.GBP) || rates.GBP;
          if (r.JPY) rates.JPY = parseFloat(r.JPY) || rates.JPY;
          if (r.CHF) rates.CHF = parseFloat(r.CHF) || rates.CHF;
          if (r.CAD) rates.CAD = parseFloat(r.CAD) || rates.CAD;
          if (r.AUD) rates.AUD = parseFloat(r.AUD) || rates.AUD;
          if (r.CNY) rates.CNY = parseFloat(r.CNY) || rates.CNY;
          if (r.BTC) rates.BTC = parseFloat(r.BTC) || rates.BTC;
          if (r.ETH) rates.ETH = parseFloat(r.ETH) || rates.ETH;
          if (r.SOL) rates.SOL = parseFloat(r.SOL) || rates.SOL;
        }
      }
    } catch {
    }
    try {
      const cgIds = CRYPTO_LIST.map((c) => c.cgId).join(",");
      const cgRes = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${cgIds}&vs_currencies=usd,brl&include_24hr_change=true&include_24hr_vol=true`
      );
      if (cgRes.ok) {
        const cgData = await cgRes.json();
        sourcesStatus.coingecko = true;
        for (const crypto of CRYPTO_LIST) {
          const info = cgData[crypto.cgId];
          if (info && info.usd) {
            const price = Number(info.usd);
            const changePct = Number((info.usd_24h_change || 0).toFixed(2));
            const changeVal = Number((price * changePct / 100).toFixed(2));
            const volUsd = info.usd_24h_vol || 0;
            const volStr = volUsd >= 1e9 ? `$${(volUsd / 1e9).toFixed(1)}B` : `$${(volUsd / 1e6).toFixed(1)}M`;
            quotes[crypto.id] = {
              symbol: crypto.id,
              price,
              change: changeVal,
              changePercent: changePct,
              high: Number((price * (1 + Math.max(5e-3, Math.abs(changePct) / 100 * 0.8))).toFixed(2)),
              low: Number((price * (1 - Math.max(5e-3, Math.abs(changePct) / 100 * 0.8))).toFixed(2)),
              open: Number((price - changeVal).toFixed(2)),
              previousClose: Number((price - changeVal).toFixed(2)),
              volume: volStr,
              currency: "USD",
              source: "coingecko_live"
            };
            if (crypto.id === "BTC/USD") {
              rates.BTC = Number((1 / price).toFixed(8));
              pairs["BTCBRL"] = {
                code: "BTC",
                codein: "BRL",
                name: "Bitcoin",
                high: Number((price * rates.BRL * 1.015).toFixed(2)),
                low: Number((price * rates.BRL * 0.985).toFixed(2)),
                bid: Number((info.brl || price * rates.BRL).toFixed(2)),
                ask: Number((info.brl || price * rates.BRL).toFixed(2)),
                varBid: Number(((info.brl || price * rates.BRL) * (info.brl_24h_change || changePct) / 100).toFixed(2)),
                pctChange: Number((info.brl_24h_change || changePct).toFixed(2)),
                timestamp: (/* @__PURE__ */ new Date()).toISOString()
              };
            }
          }
        }
      }
    } catch {
    }
    const missingCryptos = CRYPTO_LIST.filter((c) => !quotes[c.id]);
    if (missingCryptos.length > 0) {
      await Promise.all(
        missingCryptos.map(async (c) => {
          try {
            const spotRes = await fetch(`https://api.coinbase.com/v2/prices/${c.pairUsd}/spot`);
            if (spotRes.ok) {
              const spotData = await spotRes.json();
              const p = parseFloat(spotData?.data?.amount);
              if (p > 0) {
                sourcesStatus.coinbase = true;
                quotes[c.id] = {
                  symbol: c.id,
                  price: p,
                  change: 0,
                  changePercent: 0,
                  high: Number((p * 1.01).toFixed(2)),
                  low: Number((p * 0.99).toFixed(2)),
                  open: p,
                  previousClose: p,
                  volume: "$1.2B",
                  currency: "USD",
                  source: "coinbase_spot"
                };
              }
            }
          } catch {
          }
        })
      );
    }
    const yahooEntries = Object.entries(YAHOO_SYMBOLS_MAP);
    const chunkSize = 15;
    for (let i = 0; i < yahooEntries.length; i += chunkSize) {
      const chunk = yahooEntries.slice(i, i + chunkSize);
      await Promise.all(
        chunk.map(async ([dinhSymbol, meta]) => {
          try {
            const yRes = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${meta.yahoo}?interval=1d`, {
              headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "application/json"
              }
            });
            if (yRes.ok) {
              const yData = await yRes.json();
              const m = yData?.chart?.result?.[0]?.meta;
              if (m && m.regularMarketPrice !== void 0) {
                sourcesStatus.yahooFinance = true;
                const currentPrice = Number(m.regularMarketPrice.toFixed(meta.currency === "BRL" && dinhSymbol.includes("/") ? 4 : 2));
                const prevClose = Number((m.chartPreviousClose || m.previousClose || currentPrice).toFixed(meta.currency === "BRL" && dinhSymbol.includes("/") ? 4 : 2));
                const changeVal = Number((currentPrice - prevClose).toFixed(meta.currency === "BRL" && dinhSymbol.includes("/") ? 4 : 2));
                const changePct = prevClose > 0 ? Number((changeVal / prevClose * 100).toFixed(2)) : 0;
                const highVal = m.regularMarketDayHigh !== void 0 ? Number(m.regularMarketDayHigh.toFixed(2)) : Number((currentPrice * 1.01).toFixed(2));
                const lowVal = m.regularMarketDayLow !== void 0 ? Number(m.regularMarketDayLow.toFixed(2)) : Number((currentPrice * 0.99).toFixed(2));
                const openVal = m.regularMarketOpen !== void 0 ? Number(m.regularMarketOpen.toFixed(2)) : prevClose;
                let volStr = "N/A";
                if (m.regularMarketVolume) {
                  const vol = m.regularMarketVolume;
                  volStr = vol >= 1e9 ? `${(vol / 1e9).toFixed(1)}B` : vol >= 1e6 ? `${(vol / 1e6).toFixed(1)}M` : `${Math.round(vol / 1e3)}K`;
                }
                quotes[dinhSymbol] = {
                  symbol: dinhSymbol,
                  price: currentPrice,
                  change: changeVal,
                  changePercent: changePct,
                  high: highVal,
                  low: lowVal,
                  open: openVal,
                  previousClose: prevClose,
                  volume: volStr,
                  currency: meta.currency,
                  source: "yahoo_finance_live"
                };
                if (dinhSymbol === "USD/BRL") {
                  rates.BRL = currentPrice;
                  pairs["USDBRL"] = {
                    code: "USD",
                    codein: "BRL",
                    name: "D\xF3lar Comercial",
                    high: highVal,
                    low: lowVal,
                    bid: currentPrice,
                    ask: Number((currentPrice + 2e-3).toFixed(4)),
                    varBid: changeVal,
                    pctChange: changePct,
                    timestamp: (/* @__PURE__ */ new Date()).toISOString()
                  };
                } else if (dinhSymbol === "EUR/BRL") {
                  pairs["EURBRL"] = {
                    code: "EUR",
                    codein: "BRL",
                    name: "Euro Comercial",
                    high: highVal,
                    low: lowVal,
                    bid: currentPrice,
                    ask: Number((currentPrice + 3e-3).toFixed(4)),
                    varBid: changeVal,
                    pctChange: changePct,
                    timestamp: (/* @__PURE__ */ new Date()).toISOString()
                  };
                } else if (dinhSymbol === "GBP/BRL") {
                  pairs["GBPBRL"] = {
                    code: "GBP",
                    codein: "BRL",
                    name: "Libra Esterlina",
                    high: highVal,
                    low: lowVal,
                    bid: currentPrice,
                    ask: Number((currentPrice + 4e-3).toFixed(4)),
                    varBid: changeVal,
                    pctChange: changePct,
                    timestamp: (/* @__PURE__ */ new Date()).toISOString()
                  };
                } else if (dinhSymbol === "CHF/BRL") {
                  pairs["CHFBRL"] = {
                    code: "CHF",
                    codein: "BRL",
                    name: "Franco Su\xED\xE7o",
                    high: highVal,
                    low: lowVal,
                    bid: currentPrice,
                    ask: Number((currentPrice + 3e-3).toFixed(4)),
                    varBid: changeVal,
                    pctChange: changePct,
                    timestamp: (/* @__PURE__ */ new Date()).toISOString()
                  };
                } else if (dinhSymbol === "JPY/BRL") {
                  pairs["JPYBRL"] = {
                    code: "JPY",
                    codein: "BRL",
                    name: "Iene Japon\xEAs",
                    high: highVal,
                    low: lowVal,
                    bid: currentPrice,
                    ask: currentPrice,
                    varBid: changeVal,
                    pctChange: changePct,
                    timestamp: (/* @__PURE__ */ new Date()).toISOString()
                  };
                }
              }
            }
          } catch {
          }
        })
      );
    }
    if (finnhubKey && finnhubKey !== "MY_FINNHUB_API_KEY") {
      const priorityStocks = ["AAPL", "MSFT", "NVDA", "AMZN", "GOOGL", "META", "TSLA"];
      for (const sym of priorityStocks) {
        try {
          const fhRes = await fetch(`https://finnhub.io/api/v1/quote?symbol=${sym}&token=${finnhubKey}`);
          if (fhRes.ok) {
            const data = await fhRes.json();
            if (data && data.c && data.c > 0) {
              sourcesStatus.finnhub = true;
              quotes[sym] = {
                symbol: sym,
                price: Number(data.c.toFixed(2)),
                change: Number(data.d.toFixed(2)),
                changePercent: Number(data.dp.toFixed(2)),
                high: Number(data.h.toFixed(2)),
                low: Number(data.l.toFixed(2)),
                open: Number(data.o.toFixed(2)),
                previousClose: Number(data.pc.toFixed(2)),
                currency: "USD",
                source: "finnhub_official"
              };
            }
          }
        } catch {
        }
      }
    }
    let newsList = [];
    if (finnhubKey && finnhubKey !== "MY_FINNHUB_API_KEY") {
      try {
        const newsRes = await fetch(`https://finnhub.io/api/v1/news?category=general&token=${finnhubKey}`);
        if (newsRes.ok) {
          const newsData = await newsRes.json();
          if (Array.isArray(newsData) && newsData.length > 0) {
            newsList = newsData.slice(0, 8).map((n, idx) => ({
              id: `fh_news_${idx}`,
              title: n.headline,
              summary: n.summary,
              source: n.source || "Finnhub Market Wire",
              url: n.url,
              category: n.category || "Geral",
              datetime: n.datetime ? new Date(n.datetime * 1e3).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "Agora",
              imageUrl: n.image
            }));
          }
        }
      } catch {
      }
    }
    for (const [sym, override] of Object.entries(webhookQuoteOverrides)) {
      if (override && override.price > 0) {
        const existing = quotes[sym];
        const prevClose = existing?.previousClose || override.price;
        const isBrlPair = sym.includes("/") && (existing?.currency === "BRL" || sym.endsWith("/BRL"));
        const changeVal = Number((override.price - prevClose).toFixed(isBrlPair ? 4 : 2));
        const changePct = prevClose > 0 ? Number((changeVal / prevClose * 100).toFixed(2)) : 0;
        const high = existing ? Math.max(existing.high, override.price) : Number((override.price * 1.01).toFixed(2));
        const low = existing ? Math.min(existing.low, override.price) : Number((override.price * 0.99).toFixed(2));
        quotes[sym] = {
          symbol: sym,
          price: override.price,
          change: changeVal,
          changePercent: changePct,
          high,
          low,
          open: existing?.open || prevClose,
          previousClose: prevClose,
          volume: override.volume ? `${override.volume}` : existing?.volume || "N/A",
          currency: existing?.currency || (sym.includes("BRL") ? "BRL" : "USD"),
          source: "finnhub_webhook_live"
        };
        sourcesStatus.finnhub = true;
      }
    }
    cachedData = {
      rates,
      pairs,
      quotes,
      news: newsList,
      sourcesStatus,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    lastCacheTime = now;
  } finally {
    isRefreshing = false;
  }
  return cachedData;
}
function updateQuoteFromWebhook(rawSymbol, price, volume, timestamp) {
  if (!rawSymbol || typeof price !== "number" || isNaN(price) || price <= 0) {
    return;
  }
  let symbol = rawSymbol.trim().toUpperCase();
  if (symbol.startsWith("BINANCE:") || symbol.startsWith("COINBASE:")) {
    const pair = symbol.split(":")[1];
    if (pair.endsWith("USDT") || pair.endsWith("USD")) {
      const base = pair.replace(/USDT$|USD$/, "");
      symbol = `${base}/USD`;
    }
  } else if (symbol.includes(":")) {
    symbol = symbol.split(":")[1];
  }
  if (symbol.endsWith(".SA")) {
    symbol = symbol.replace(".SA", "");
  }
  if (symbol === "EURUSD") symbol = "EUR/USD";
  if (symbol === "GBPUSD") symbol = "GBP/USD";
  if (symbol === "USDJPY") symbol = "USD/JPY";
  if (symbol === "USDBRL") symbol = "USD/BRL";
  if (symbol === "EURBRL") symbol = "EUR/BRL";
  const now = Date.now();
  webhookQuoteOverrides[symbol] = {
    price,
    volume,
    timestamp: timestamp || now,
    source: "finnhub_webhook"
  };
  if (cachedData) {
    const existing = cachedData.quotes[symbol];
    const prevClose = existing?.previousClose || price;
    const isBrlPair = symbol.includes("/") && (existing?.currency === "BRL" || symbol.endsWith("/BRL"));
    const changeVal = Number((price - prevClose).toFixed(isBrlPair ? 4 : 2));
    const changePct = prevClose > 0 ? Number((changeVal / prevClose * 100).toFixed(2)) : 0;
    const high = existing ? Math.max(existing.high, price) : Number((price * 1.01).toFixed(2));
    const low = existing ? Math.min(existing.low, price) : Number((price * 0.99).toFixed(2));
    cachedData.quotes[symbol] = {
      symbol,
      price,
      change: changeVal,
      changePercent: changePct,
      high,
      low,
      open: existing?.open || prevClose,
      previousClose: prevClose,
      volume: volume ? volume >= 1e6 ? `${(volume / 1e6).toFixed(1)}M` : `${Math.round(volume)}` : existing?.volume || "N/A",
      currency: existing?.currency || (symbol.includes("BRL") ? "BRL" : "USD"),
      source: "finnhub_webhook_live"
    };
    if (symbol === "USD/BRL") {
      cachedData.rates.BRL = price;
      if (cachedData.pairs["USDBRL"]) {
        cachedData.pairs["USDBRL"].bid = price;
        cachedData.pairs["USDBRL"].varBid = changeVal;
        cachedData.pairs["USDBRL"].pctChange = changePct;
        cachedData.pairs["USDBRL"].timestamp = (/* @__PURE__ */ new Date()).toISOString();
      }
    } else if (symbol === "BTC/USD") {
      cachedData.rates.BTC = Number((1 / price).toFixed(8));
      if (cachedData.pairs["BTCBRL"]) {
        const brlPrice = Number((price * cachedData.rates.BRL).toFixed(2));
        cachedData.pairs["BTCBRL"].bid = brlPrice;
        cachedData.pairs["BTCBRL"].pctChange = changePct;
        cachedData.pairs["BTCBRL"].timestamp = (/* @__PURE__ */ new Date()).toISOString();
      }
    } else if (symbol === "ETH/USD") {
      cachedData.rates.ETH = Number((1 / price).toFixed(8));
    } else if (symbol === "SOL/USD") {
      cachedData.rates.SOL = Number((1 / price).toFixed(6));
    }
    cachedData.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    cachedData.sourcesStatus.finnhub = true;
  }
}

// src/server/webhookHandler.ts
var recentWebhookEvents = [];
function validateWebhookHeader(secretHeader, expectedSecret = process.env.FINNHUB_WEBHOOK_SECRET || "dbfsnl9r01qiahublh4g") {
  const headerValue = Array.isArray(secretHeader) ? secretHeader[0] : secretHeader;
  if (!headerValue || headerValue.trim() !== expectedSecret.trim()) {
    return {
      isValid: false,
      statusCode: 401,
      response: { error: "Unauthorized" }
    };
  }
  return {
    isValid: true,
    statusCode: 200,
    response: { received: true }
  };
}
async function processarEventoEmBackground(data) {
  try {
    console.log("[DinhEuro Webhook] Processando evento da Finnhub:", JSON.stringify(data));
    recentWebhookEvents.unshift({
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      event: data
    });
    if (recentWebhookEvents.length > 50) {
      recentWebhookEvents.pop();
    }
    if (data && data.type === "trade" && Array.isArray(data.data)) {
      for (const trade of data.data) {
        if (trade && trade.s && typeof trade.p === "number") {
          updateQuoteFromWebhook(trade.s, trade.p, trade.v, trade.t);
        }
      }
    }
  } catch (error) {
    console.error("[DinhEuro Webhook] Erro ao processar dados do webhook:", error);
  }
}
function getWebhookStatus() {
  const expectedSecret = process.env.FINNHUB_WEBHOOK_SECRET || "dbfsnl9r01qiahublh4g";
  return {
    status: "active",
    endpoint: "/api/webhook/finnhub",
    expectedHeader: "x-finnhub-secret",
    secretConfigured: !!expectedSecret,
    totalEventsReceived: recentWebhookEvents.length,
    recentEvents: recentWebhookEvents.slice(0, 5),
    latestTicksApplied: Object.keys(webhookQuoteOverrides).length
  };
}

// server.ts
import_dotenv.default.config();
process.env.DISABLE_HMR = "true";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
async function startServer() {
  const app = express();
  app.use(express.json());
  app.post("/api/webhook/finnhub", (req, res) => {
    const secretHeader = req.headers["x-finnhub-secret"] || req.headers["X-Finnhub-Secret"] || req.query.secret || req.body?.secret;
    const expectedSecret = process.env.FINNHUB_WEBHOOK_SECRET || "dbfsnl9r01qiahublh4g";
    const validation = validateWebhookHeader(secretHeader, expectedSecret);
    if (!validation.isValid) {
      console.warn("[DinhEuro Webhook] Tentativa n\xE3o autorizada recebida no endpoint Finnhub.");
      return res.status(validation.statusCode).json(validation.response);
    }
    res.status(200).json({ received: true });
    const eventData = req.body;
    processarEventoEmBackground(eventData);
  });
  app.get("/api/webhook/finnhub", (_req, res) => {
    res.json({
      status: "active",
      message: "Endpoint do Webhook Finnhub ativo e pronto para receber POST requests.",
      endpoint: "/api/webhook/finnhub",
      headerName: "x-finnhub-secret",
      documentation: "Configure este endpoint no painel de Webhooks da Finnhub com o segredo FINNHUB_WEBHOOK_SECRET."
    });
  });
  app.get("/api/webhook/finnhub/status", (_req, res) => {
    res.json(getWebhookStatus());
  });
  app.get("/api/market/live", async (_req, res) => {
    try {
      const data = await getAggregatedMarketData();
      res.json(data);
    } catch (err) {
      console.error("[DinhEuro] Erro ao agregar dados de mercado:", err);
      res.status(500).json({ error: "Erro ao obter dados de mercado em tempo real" });
    }
  });
  app.get("/api/awesomeapi/last", async (_req, res) => {
    try {
      const awesomeUrl = process.env.VITE_AWESOME_ECONOMY_URL || "https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,GBP-BRL,BTC-BRL,ETH-BRL,CAD-BRL,AUD-BRL,CHF-BRL,JPY-BRL,CNY-BRL";
      const response = await fetch(awesomeUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) DinhEuro/3.0",
          "Accept": "application/json"
        }
      });
      if (response.ok) {
        const data = await response.json();
        return res.json(data);
      }
      return res.status(response.status).json({ error: "AwesomeAPI upstream rate limit" });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", time: (/* @__PURE__ */ new Date()).toISOString() });
  });
  const isDev = process.env.NODE_ENV === "development";
  if (isDev) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: "0.0.0.0",
        port: 3e3,
        hmr: false
      },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }
  const PORT = process.env.PORT || 3e3;
  app.listen(PORT, () => {
    console.log(`[DinhEuro] Servidor rodando na porta ${PORT} (${isDev ? "Desenvolvimento" : "Produ\xE7\xE3o/Hostinger"})`);
    console.log(`[DinhEuro] Endpoint do Webhook Finnhub pronto em: POST http://localhost:${PORT}/api/webhook/finnhub`);
  });
}
startServer().catch((err) => {
  console.error("[DinhEuro] Erro fatal ao iniciar o servidor:", err);
  process.exit(1);
});
