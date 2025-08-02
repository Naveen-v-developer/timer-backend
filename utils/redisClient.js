const redis = require("redis");

const client = redis.createClient();

client.on("error", (err) => console.error("❌ Redis Error:", err));
client.connect().then(() => {
  console.log("✅ Redis connected");
});

module.exports = client;
