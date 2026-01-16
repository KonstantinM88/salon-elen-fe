const apiKey = process.env.MOBIZON_API_KEY;

const url = `https://api.mobizon.gmbh/service/message/sendSmsMessage?output=json&api=v1&apiKey=${encodeURIComponent(apiKey)}`;

const body = new URLSearchParams({
  recipient: "4917671764743",
  text: "Test code 1234",
});

const res = await fetch(url, {
  method: "POST",
  headers: { "content-type": "application/x-www-form-urlencoded" },
  body,
});

console.log("HTTP", res.status);
console.log(await res.text());
console.log("API key exists:", Boolean(process.env.MOBIZON_API_KEY));
console.log("API key length:", (process.env.MOBIZON_API_KEY || "").length);

