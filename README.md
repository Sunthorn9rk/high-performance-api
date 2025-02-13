# high-performance-api
ออกแบบ API ที่สามารถรองรับ 100,000 requests per second (RPS) ได้โดยไม่ให้เซิร์ฟเวอร์ล่ม และคำนึงถึงค่า server ด้วยเป็นหลัก โดยใช้ ใช้ techstack อะไรก็ได้  --- 1 request ต้อง ตรวจสอบ check user และ ตรวจสอบยอดเงิน จาก api ภายนอก

# sequence diagram
User -> API Gateway: ส่ง Request ตรวจสอบ User และ Balance
API Gateway -> API Server: ส่งต่อ Request ไปยัง Backend
API Server -> Redis: ตรวจสอบ Cache ว่ามีข้อมูลอยู่หรือไม่
alt ข้อมูลอยู่ใน Cache
Redis -> API Server: คืนค่าจาก Cache
else ไม่มีข้อมูลใน Cache
API Server -> External API: ขอข้อมูล User และ Balance
External API -> API Server: ส่งผลลัพธ์กลับมา
API Server -> Redis: เก็บผลลัพธ์ลง Cache
end
API Server -> User: ส่ง Response กลับไป

# เทคโนโลยีที่ใช้	และเหตุผลที่เลือก
Backend	Node.js (Fastify)	เพราะเร็วและรองรับ high concurrency
Database / Cache	 Redis	เพราะใช้เก็บ session และลดการเรียก API ภายนอก
Message Queue	Kafka	เพราะรองรับ high throughput และ event-driven architecture
Load Balancer	NGINX	เพราะกระจายโหลดระหว่าง API Server
API Caching	Redis 	เพราะลดการเรียก API ภายนอกซ้ำซ้อน
Containerization	Docker 	เพราะทำให้ระบบ scale ได้ง่าย

