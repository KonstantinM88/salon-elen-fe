// test-zadarma-correct.js
// Тест с ПРАВИЛЬНЫМ алгоритмом подписи

const crypto = require('crypto');

// ВСТАВЬТЕ ВАШИ КЛЮЧИ:
const API_KEY = '3395637277f940afdf40';
const API_SECRET = '12d7b42d20db47bf5c4b';

console.log('=== ТЕСТ С ПРАВИЛЬНЫМ АЛГОРИТМОМ ===\n');
console.log('API Key:', API_KEY);
console.log('API Secret:', API_SECRET.substring(0, 10) + '***\n');

// ПРАВИЛЬНАЯ функция генерации подписи
function generateSignature(method, params) {
  // 1. MD5 от параметров
  const paramsMd5 = crypto.createHash('md5').update(params).digest('hex');
  
  // 2. Строка для подписи: method + params + md5(params)
  const signString = method + params + paramsMd5;
  
  // 3. HMAC-SHA1 с секретом
  const hmac = crypto.createHmac('sha1', API_SECRET);
  hmac.update(signString);
  
  // 4. Base64 encoding
  const signature = hmac.digest('base64');
  
  return signature;
}

async function testBalance() {
  console.log('1. Тест запроса баланса\n');
  
  const method = '/v1/info/balance/';
  const params = ''; // Пустые параметры
  
  const signature = generateSignature(method, params);
  
  console.log('Method:', method);
  console.log('Params:', params || '(пусто)');
  console.log('Params MD5:', crypto.createHash('md5').update(params).digest('hex'));
  console.log('Sign string:', method + params + crypto.createHash('md5').update(params).digest('hex'));
  console.log('Signature (Base64):', signature);
  console.log('Authorization:', `${API_KEY}:${signature}\n`);
  
  try {
    const response = await fetch(`https://api.zadarma.com${method}`, {
      method: 'GET',
      headers: {
        'Authorization': `${API_KEY}:${signature}`,
      },
    });
    
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (data.status === 'success') {
      console.log('\n✅ ✅ ✅ АВТОРИЗАЦИЯ РАБОТАЕТ! ✅ ✅ ✅\n');
      console.log('Баланс:', data.balance, data.currency);
      return true;
    } else {
      console.log('\n❌ Ошибка:', data.message, '\n');
      return false;
    }
  } catch (error) {
    console.log('\n❌ Ошибка запроса:', error.message, '\n');
    return false;
  }
}

async function testSms() {
  console.log('2. Тест отправки SMS\n');
  
  const method = '/v1/sms/send/';
  const paramsObj = {
    message: 'Test from API',
    number: '4917612345678' // Тестовый номер
  };
  
  // Сортируем и форматируем параметры
  const sortedKeys = Object.keys(paramsObj).sort();
  const params = sortedKeys
    .map(key => `${key}=${encodeURIComponent(paramsObj[key])}`)
    .join('&');
  
  const signature = generateSignature(method, params);
  
  console.log('Method:', method);
  console.log('Params:', params);
  console.log('Signature:', signature, '\n');
  
  try {
    const response = await fetch(`https://api.zadarma.com${method}?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `${API_KEY}:${signature}`,
      },
    });
    
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (data.status === 'success') {
      console.log('\n✅ SMS отправлено успешно!\n');
      return true;
    } else {
      console.log('\n⚠️  Статус:', data.message, '\n');
      // Если не "Not authorized" - значит авторизация прошла!
      if (data.message !== 'Not authorized') {
        console.log('✅ АВТОРИЗАЦИЯ РАБОТАЕТ! (ошибка в другом)\n');
        return true;
      }
      return false;
    }
  } catch (error) {
    console.log('\n❌ Ошибка запроса:', error.message, '\n');
    return false;
  }
}

// Запускаем тесты
(async () => {
  console.log('='.repeat(60) + '\n');
  
  const test1 = await testBalance();
  
  console.log('='.repeat(60) + '\n');
  
  if (test1) {
    await testSms();
  } else {
    console.log('⚠️  Первый тест не прошёл - пропускаем тест SMS\n');
  }
  
  console.log('='.repeat(60));
  console.log('\nИТОГ:');
  
  if (test1) {
    console.log('✅ Алгоритм подписи ПРАВИЛЬНЫЙ!');
    console.log('✅ API ключи ПРАВИЛЬНЫЕ!');
    console.log('✅ Можно использовать новый код!\n');
  } else {
    console.log('❌ Всё ещё ошибка авторизации');
    console.log('Возможно проблема в самих ключах\n');
  }
})();
