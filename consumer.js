import {Kafka} from "kafkajs";
import axios from "axios";
import Redis from "ioredis";

const kafka = new Kafka({
  clientId: "high-performance-api",
  brokers: ["localhost:9092"],
});

const consumer = kafka.consumer({groupId: "user-group"});
const redis = new Redis();

const startConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({topic: "user_check", fromBeginning: false});

  console.log("✅ Kafka Consumer Connected and Listening...");

  await consumer.run({
    eachMessage: async ({topic, partition, message}) => {
      const userData = JSON.parse(message.value.toString());
      console.log(`📥 Received Kafka Message:`, userData);

      try {
        // ตรวจสอบยอดเงินจาก API ภายนอก
        const balanceResponse = await axios.get(
          `http://localhost:5000/balance/${userData.id}`
        );
        const balanceData = balanceResponse.data;

        console.log(`💰 User Balance:`, balanceData);

        // Cache ข้อมูลลง Redis (60 วินาที)
        const cacheKey = `user_balance:${userData.id}`;
        await redis.setex(
          cacheKey,
          60,
          JSON.stringify({userData, balanceData})
        );

        console.log(`✅ Cached user balance in Redis`);
      } catch (error) {
        console.error("❌ Error processing message:", error);
      }
    },
  });
};

// Graceful Shutdown
process.on("SIGINT", async () => {
  await consumer.disconnect();
  console.log("🔴 Kafka Consumer Disconnected");
  process.exit(0);
});

// Start Consumer
startConsumer().catch(console.error);
