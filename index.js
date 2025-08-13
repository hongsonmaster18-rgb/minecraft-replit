const express = require('express');
const app = express();
const path = require('path');

let winCount = 0;

let countdownTime = 0;     // Tổng số giây còn lại
let lastUpdated = 0;       // Thời điểm cuối được cập nhật (ms)

let moveTime = 0;         // Tổng số giây còn lại cho timeMove
let moveUpdated = 0;      // Lần cập nhật cuối cùng (timestamp ms)


app.use(express.json({ type: ['application/json', 'application/json; charset=utf-8'] }));
app.use(express.static(__dirname));

// Gửi file HTML chính
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Gửi dữ liệu win
app.get('/data', (req, res) => {
  res.json({ win: winCount });
});

// Nhận dữ liệu win từ plugin
app.post('/win', (req, res) => {
  const { win } = req.body;
  if (typeof win !== 'number') {
    return res.status(400).json({ error: 'Thiếu hoặc sai định dạng "win"' });
  }

  winCount = win;
  console.log("✅ Win cập nhật:", win);
  res.json({ success: true });
});

// ✅ Xử lý lệnh /choang gửi lên (từ plugin)
app.post('/time', (req, res) => {
  console.log("📩 Nhận lệnh /time từ Java");

  const now = Date.now();
  const passed = Math.floor((now - lastUpdated) / 1000);
  const remaining = Math.max(0, countdownTime - passed);

  countdownTime = remaining + 14; // ✅ CỘNG DỒN THÊM 14s nếu đang đếm
  lastUpdated = now;

  console.log(`🕒 Đếm ngược mới: ${countdownTime}s`);
  res.json({ success: true });
});


// ✅ Xử lý lệnh /timemove từ Java
app.post('/timemove', (req, res) => {
  console.log("📩 Nhận lệnh /timemove từ Java");

  const now = Date.now();
  const passed = Math.floor((now - moveUpdated) / 1000);
  const remaining = Math.max(0, moveTime - passed);

  moveTime = remaining + 3; // ✅ CỘNG DỒN 3 giây
  moveUpdated = now;

  console.log(`🕒 TimeMove mới: ${moveTime}s`);
  res.json({ success: true });
});

// Gửi thời gian còn lại cho frontend
app.get('/time', (req, res) => {
  res.json({
    countdownTime,
    lastUpdated,
    moveTime,
    moveUpdated,
    serverTime: Date.now()
  });
});


// Chạy server
app.listen(3000, () => {
  console.log("✅ Server chạy tại cổng 3000");
});
