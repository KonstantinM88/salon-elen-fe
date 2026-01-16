// ZADARMA_SMS/test-zadarma.mjs
import crypto from "crypto";

const API_KEY = process.env.ZADARMA_API_KEY;
const API_SECRET = process.env.ZADARMA_API_SECRET;

const BASE = "https://api.zadarma.com";
const METHOD_BALANCE = "/v1/info/balance/";
const METHOD_SMS_SEND = "/v1/sms/send/";

function encodeValue(v) {
  return encodeURIComponent(v).replace(/%20/g, "+");
}

function formatParams(params) {
  const keys = Object.keys(params).sort();
  return keys.map((k) => `${k}=${encodeValue(params[k])}`).join("&");
}

function md5Hex(s) {
  return crypto.createHash("md5").update(s).digest("hex");
}

function signature(method, paramsStr) {
  const paramsMd5 = md5Hex(paramsStr);
  const signString = method + paramsStr + paramsMd5;
  return crypto.createHmac("sha1", API_SECRET).update(signString).digest("base64");
}

async function post(methodPath, params) {
  const paramsStr = formatParams(params);
  const sig = signature(methodPath, paramsStr);

  const res = await fetch(`${BASE}${methodPath}`, {
    method: "POST",
    headers: {
      Authorization: `${API_KEY}:${sig}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: paramsStr,
  });

  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Non-JSON response. HTTP ${res.status}. Body: ${text}`);
  }
  return { http: res.status, json };
}

async function main() {
  console.log("API key exists:", Boolean(API_KEY));
  console.log("API secret exists:", Boolean(API_SECRET));
  console.log("API key length:", (API_KEY || "").length);
  console.log("API secret length:", (API_SECRET || "").length);
  console.log("----");

  if (!API_KEY || !API_SECRET) {
    console.error("Missing env. Set ZADARMA_API_KEY and ZADARMA_API_SECRET.");
    process.exit(1);
  }

  console.log("1) Balance test");
  const bal = await post(METHOD_BALANCE, {});
  console.log("HTTP:", bal.http);
  console.log("Response:", bal.json);
  console.log("----");

  const phone = process.env.TEST_PHONE; // e.g. 4917xxxxxxx (digits only) or +49...
  if (!phone) {
    console.log("TEST_PHONE not set, skipping SMS test.");
    console.log('To test SMS: set TEST_PHONE, e.g. export TEST_PHONE="49176xxxxxxx"');
    return;
  }

  const cleanedPhone = String(phone).replace(/\D/g, "");
  const pin = String(Math.floor(1000 + Math.random() * 9000));

  console.log("2) SMS test");
  const sms = await post(METHOD_SMS_SEND, {
    number: cleanedPhone,
    message: `Test OTP code: ${pin}`,
  });

  console.log("HTTP:", sms.http);
  console.log("Response:", sms.json);
}

main().catch((e) => {
  console.error("FAILED:", e);
  process.exit(1);
});







// // test-zadarma.js
// // Тестовый скрипт для проверки авторизации Zadarma

// const crypto = require('crypto');

// // ВСТАВЬТЕ ВАШИ КЛЮЧИ СЮДА:
// const API_KEY = '3395637277f940afdf40'; // Ваш полный ключ
// const API_SECRET = '12d7b42d20db47bf5c4b'; // Ваш полный секрет

// console.log('=== ТЕСТ ZADARMA API ===\n');

// // Тест 1: Простой запрос баланса (без параметров)
// async function testBalance() {
//   console.log('1. Тест запроса баланса...\n');
  
//   const method = '/v1/info/balance/';
//   const params = ''; // Нет параметров
  
//   // Генерируем подпись
//   const signString = method + params + API_SECRET;
//   const signature = crypto.createHash('md5').update(signString).digest('hex');
  
//   console.log('Method:', method);
//   console.log('Params:', params || '(пусто)');
//   console.log('Sign string:', signString);
//   console.log('Signature:', signature);
//   console.log('Authorization:', `${API_KEY}:${signature}\n`);
  
//   try {
//     const response = await fetch(`https://api.zadarma.com${method}`, {
//       method: 'GET',
//       headers: {
//         'Authorization': `${API_KEY}:${signature}`,
//       },
//     });
    
//     const data = await response.json();
//     console.log('Response:', JSON.stringify(data, null, 2));
    
//     if (data.status === 'success') {
//       console.log('✅ Авторизация работает!\n');
//       return true;
//     } else {
//       console.log('❌ Ошибка авторизации:', data.message, '\n');
//       return false;
//     }
//   } catch (error) {
//     console.log('❌ Ошибка запроса:', error.message, '\n');
//     return false;
//   }
// }

// // Тест 2: Запрос с параметрами (тарифы на SMS)
// async function testSmsPrice() {
//   console.log('2. Тест запроса тарифов SMS...\n');
  
//   const method = '/v1/tariff/';
//   const params = 'type=sms';
  
//   // Генерируем подпись
//   const signString = method + params + API_SECRET;
//   const signature = crypto.createHash('md5').update(signString).digest('hex');
  
//   console.log('Method:', method);
//   console.log('Params:', params);
//   console.log('Signature:', signature);
//   console.log('URL:', `https://api.zadarma.com${method}?${params}\n`);
  
//   try {
//     const response = await fetch(`https://api.zadarma.com${method}?${params}`, {
//       method: 'GET',
//       headers: {
//         'Authorization': `${API_KEY}:${signature}`,
//       },
//     });
    
//     const data = await response.json();
//     console.log('Response:', JSON.stringify(data, null, 2));
    
//     if (data.status === 'success') {
//       console.log('✅ Запрос с параметрами работает!\n');
//       return true;
//     } else {
//       console.log('❌ Ошибка:', data.message, '\n');
//       return false;
//     }
//   } catch (error) {
//     console.log('❌ Ошибка запроса:', error.message, '\n');
//     return false;
//   }
// }

// // Запускаем тесты
// (async () => {
//   console.log('API Key:', API_KEY);
//   console.log('API Secret:', API_SECRET.substring(0, 10) + '***\n');
//   console.log('='.repeat(50) + '\n');
  
//   const test1 = await testBalance();
//   console.log('='.repeat(50) + '\n');
  
//   if (test1) {
//     await testSmsPrice();
//   } else {
//     console.log('⚠️  Первый тест не прошёл - проверьте API ключи!\n');
//     console.log('Возможные проблемы:');
//     console.log('1. API ключи неверные или неполные');
//     console.log('2. API доступ не включён в личном кабинете');
//     console.log('3. Ключи неактивны');
//     console.log('\nПроверьте в: https://my.zadarma.com/ → Настройки → API\n');
//   }
// })();
