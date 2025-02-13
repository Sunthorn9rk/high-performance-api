import Fastify from "fastify";
import axios from "axios";
import Redis from "ioredis";

const redis = new Redis(); // เชื่อมต่อ Redis

// สร้างฟังก์ชันเพื่อรัน Fastify Server
const createServer = async (port) => {
  const fastify = Fastify({
    logger: {
      level: "info", // หรือ 'debug' เพื่อแสดง log เพิ่มเติม
    },
  });

  // Declare a route
  fastify.get("/check-user", async (request, reply) => {
    const {userId} = request.query; // Destructure userId
    const cacheKey = `user:${userId}`;

    // Validate userId format
    if (!userId || typeof userId !== "string") {
      return reply.status(400).send({error: "Valid userId is required"});
    }

    try {
      // Check Cache
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        fastify.log.info("Fetch data from Redis!!!");
        return reply.send(JSON.parse(cachedData)); // คืน cached data กลับ
      }

      // เรียก External API
      const response = await axios.get(`http://localhost:5000/users/${userId}`);
      const userData = response.data;

      // ตรวจสอบ user data
      if (!userData) {
        return reply.status(404).send({error: "User not found"});
      }

      // Cache Data ไว้ 10 วินาที
      await redis.setex(cacheKey, 10, JSON.stringify(userData));
      fastify.log.info("Fetch data from External API!!!");
      return reply.send(userData); // ส่ง user data กลับ
    } catch (error) {
      fastify.log.error(error);
      return reply
        .status(500)
        .send({error: "Failed to fetch user data from external API"});
    }
  });

  try {
    await fastify.listen({port});
    fastify.log.info(`Server running at http://localhost:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// รัน Fastify API ทั้ง 3 พอร์ต
const runServers = async () => {
  await Promise.all([
    createServer(3000),
    createServer(3001),
    createServer(3002),
  ]);
};

runServers();
