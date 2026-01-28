// 共享内存存储（与vote.js相同）
let voteCounts = { blue: 0, red: 0, total: 0 };

module.exports = async (req, res) => {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // 只处理GET请求
  if (req.method !== 'GET') {
    return res.status(405).json({ error: '只允许GET请求' });
  }
  
  try {
    const bluePercent = voteCounts.total > 0 
      ? Math.round((voteCounts.blue / voteCounts.total) * 100) 
      : 0;
    const redPercent = voteCounts.total > 0 
      ? Math.round((voteCounts.red / voteCounts.total) * 100) 
      : 0;
    
    return res.json({
      success: true,
      blue: voteCounts.blue,
      red: voteCounts.red,
      total: voteCounts.total,
      bluePercent,
      redPercent
    });
    
  } catch (error) {
    console.error('获取统计错误:', error);
    return res.status(500).json({ error: '服务器错误' });
  }
};