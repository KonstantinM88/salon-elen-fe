// ZADARMA_SMS/test-zadarma-v2.mjs
import crypto from "crypto";

const API_KEY = process.env.ZADARMA_API_KEY || "";
const API_SECRET = process.env.ZADARMA_API_SECRET || "";
const BASE = "https://api.zadarma.com";

function assertEnv() {
  if (!API_KEY || !API_SECRET) {
    throw new Error("Missing env: ZADARMA_API_KEY / ZADARMA_API_SECRET");
  }
}

function phpUrlencode(input) {
  return encodeURIComponent(input)
    .replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`)
    .replace(/%20/g, "+");
}

function buildParams(params) {
  const keys = Object.keys(params).sort();
  return keys.map((k) => `${k}=${phpUrlencode(String(params[k]))}`).join("&");
}

function md5Hex(s) {
  return crypto.createHash("md5").update(s, "utf8").digest("hex");
}

// IMPORTANT: base64(hex-string of HMAC), like PHP base64_encode(hash_hmac(...))
function makeSignature(methodPath, paramsString) {
  const paramsMd5 = md5Hex(paramsString);
  const signSource = `${methodPath}${paramsString}${paramsMd5}`;
  const hmacHex = crypto.createHmac("sha1", API_SECRET).update(signSource, "utf8").digest("hex");
  return Buffer.from(hmacHex, "utf8").toString("base64");
}

async function request(methodPath, httpMethod, params = {}) {
  assertEnv();

  const paramsString = buildParams(params);
  const sig = makeSignature(methodPath, paramsString);

  const url =
    httpMethod === "GET"
      ? `${BASE}${methodPath}${paramsString ? `?${paramsString}` : ""}`
      : `${BASE}${methodPath}`;

  const headers = { Authorization: `${API_KEY}:${sig}` };
  const fetchOpts = { method: httpMethod, headers };

  if (httpMethod === "POST") {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    fetchOpts.body = paramsString;
  }

  const r = await fetch(url, fetchOpts);
  const text = await r.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }

  return { http: r.status, json, url };
}

(async () => {
  console.log("API key exists:", Boolean(API_KEY));
  console.log("API secret exists:", Boolean(API_SECRET));
  console.log("API key length:", API_KEY.length);
  console.log("API secret length:", API_SECRET.length);
  console.log("----");

  console.log("1) Balance test");
  const bal = await request("/v1/info/balance/", "GET");
  console.log("HTTP:", bal.http);
  console.log("URL:", bal.url);
  console.log("Response:", bal.json);
  console.log("----");

  const phone = process.env.TEST_PHONE || "";
  if (!phone) {
    console.log('TEST_PHONE not set, skipping SMS test.');
    console.log('To test SMS: export TEST_PHONE="49176xxxxxxx"');
    process.exit(0);
  }

  console.log("2) SMS test");
  const pin = String(Math.floor(1000 + Math.random() * 9000));
  const msg = `Test PIN: ${pin}`;
  const sms = await request("/v1/sms/send/", "POST", { number: phone, message: msg });

  console.log("HTTP:", sms.http);
  console.log("URL:", sms.url);
  console.log("Response:", sms.json);
})();









// // test-zadarma-v2.js
// // Расширенный тест авторизации Zadarma с разными вариантами

// const crypto = require('crypto');

// // ВСТАВЬТЕ ВАШИ КЛЮЧИ:
// const API_KEY = '3395637277f940afdf40';
// const API_SECRET = '12d7b42d20db47bf5c4b';

// console.log('=== РАСШИРЕННЫЙ ТЕСТ ZADARMA API ===\n');
// console.log('API Key:', API_KEY);
// console.log('API Secret:', API_SECRET.substring(0, 10) + '***\n');

// // Вариант 1: Стандартный метод (как сейчас)
// async function testVariant1() {
//   console.log('='.repeat(60));
//   console.log('ВАРИАНТ 1: Стандартный метод\n');
  
//   const method = '/v1/info/balance/';
//   const params = '';
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
//       console.log('✅ ВАРИАНТ 1 РАБОТАЕТ!\n');
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

// // Вариант 2: Без "/" в конце метода
// async function testVariant2() {
//   console.log('='.repeat(60));
//   console.log('ВАРИАНТ 2: Без "/" в конце\n');
  
//   const method = '/v1/info/balance'; // Без "/" в конце
//   const params = '';
//   const signString = method + params + API_SECRET;
//   const signature = crypto.createHash('md5').update(signString).digest('hex');
  
//   console.log('Method:', method);
//   console.log('Signature:', signature, '\n');
  
//   try {
//     const response = await fetch(`https://api.zadarma.com${method}/`, {
//       method: 'GET',
//       headers: {
//         'Authorization': `${API_KEY}:${signature}`,
//       },
//     });
    
//     const data = await response.json();
//     console.log('Response:', JSON.stringify(data, null, 2));
    
//     if (data.status === 'success') {
//       console.log('✅ ВАРИАНТ 2 РАБОТАЕТ!\n');
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

// // Вариант 3: С User-Agent заголовком
// async function testVariant3() {
//   console.log('='.repeat(60));
//   console.log('ВАРИАНТ 3: С User-Agent\n');
  
//   const method = '/v1/info/balance/';
//   const params = '';
//   const signString = method + params + API_SECRET;
//   const signature = crypto.createHash('md5').update(signString).digest('hex');
  
//   console.log('Method:', method);
//   console.log('Signature:', signature, '\n');
  
//   try {
//     const response = await fetch(`https://api.zadarma.com${method}`, {
//       method: 'GET',
//       headers: {
//         'Authorization': `${API_KEY}:${signature}`,
//         'User-Agent': 'SalonElen/1.0',
//       },
//     });
    
//     const data = await response.json();
//     console.log('Response:', JSON.stringify(data, null, 2));
    
//     if (data.status === 'success') {
//       console.log('✅ ВАРИАНТ 3 РАБОТАЕТ!\n');
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

// // Вариант 4: Проверка статуса API
// async function testVariant4() {
//   console.log('='.repeat(60));
//   console.log('ВАРИАНТ 4: Проверка тарифа (другой endpoint)\n');
  
//   const method = '/v1/tariff/';
//   const params = '';
//   const signString = method + params + API_SECRET;
//   const signature = crypto.createHash('md5').update(signString).digest('hex');
  
//   console.log('Method:', method);
//   console.log('Signature:', signature, '\n');
  
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
//       console.log('✅ ВАРИАНТ 4 РАБОТАЕТ!\n');
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

// // Вариант 5: Тест с параметрами
// async function testVariant5() {
//   console.log('='.repeat(60));
//   console.log('ВАРИАНТ 5: Запрос статистики с параметрами\n');
  
//   const method = '/v1/statistics/pbx/';
//   const paramsObj = {
//     start: '2025-01-01',
//     end: '2025-01-15'
//   };
  
//   // Сортируем параметры
//   const sortedKeys = Object.keys(paramsObj).sort();
//   const paramsString = sortedKeys
//     .map(key => `${key}=${paramsObj[key]}`)
//     .join('&');
  
//   const signString = method + paramsString + API_SECRET;
//   const signature = crypto.createHash('md5').update(signString).digest('hex');
  
//   console.log('Method:', method);
//   console.log('Params:', paramsString);
//   console.log('Signature:', signature, '\n');
  
//   try {
//     const response = await fetch(`https://api.zadarma.com${method}?${paramsString}`, {
//       method: 'GET',
//       headers: {
//         'Authorization': `${API_KEY}:${signature}`,
//       },
//     });
    
//     const data = await response.json();
//     console.log('Response:', JSON.stringify(data, null, 2));
    
//     if (data.status === 'success' || data.status === 'error') {
//       // Даже если ошибка но не "Not authorized" - значит авторизация прошла
//       if (data.message !== 'Not authorized') {
//         console.log('✅ ВАРИАНТ 5: Авторизация прошла! (даже если другая ошибка)\n');
//         return true;
//       }
//     }
    
//     console.log('❌ Ошибка:', data.message, '\n');
//     return false;
//   } catch (error) {
//     console.log('❌ Ошибка запроса:', error.message, '\n');
//     return false;
//   }
// }

// // Запускаем все тесты
// (async () => {
//   const results = [];
  
//   results.push(await testVariant1());
//   results.push(await testVariant2());
//   results.push(await testVariant3());
//   results.push(await testVariant4());
//   results.push(await testVariant5());
  
//   console.log('='.repeat(60));
//   console.log('ИТОГИ:\n');
  
//   const passed = results.filter(r => r).length;
  
//   if (passed > 0) {
//     console.log(`✅ ${passed} из 5 вариантов работают!`);
//     console.log('\n🎉 Авторизация настроена правильно!');
//     console.log('Используйте рабочий вариант в основном коде.\n');
//   } else {
//     console.log('❌ Ни один вариант не работает!\n');
//     console.log('ВОЗМОЖНЫЕ ПРИЧИНЫ:');
//     console.log('1. API ключи всё ещё неверные');
//     console.log('2. Нужно активировать SMS API отдельно');
//     console.log('3. Есть ограничения по IP');
//     console.log('4. Аккаунт не верифицирован\n');
//     console.log('СЛЕДУЮЩИЕ ШАГИ:');
//     console.log('1. Проверьте раздел "Услуги" → "SMS"');
//     console.log('2. Напишите в поддержку Zadarma: support@zadarma.com');
//     console.log('3. Покажите им результаты этого теста\n');
//   }
// })();
