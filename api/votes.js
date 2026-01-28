// 共享内存存储（与vote.js相同）
let votes = [];
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
    const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
    const filter = searchParams.get('filter');
    const limit = searchParams.get('limit');
    
    let filteredVotes = [...votes];
    
    // 过滤
    if (filter === 'blue' || filter === 'red') {
      filteredVotes = filteredVotes.filter(vote => vote.option === filter);
    }
    
    // 限制数量
    if (limit && !isNaN(parseInt(limit))) {
      filteredVotes = filteredVotes.slice(0, parseInt(limit));
    }
    
    // 计算百分比
    const bluePercent = voteCounts.total > 0 
      ? Math.round((voteCounts.blue / voteCounts.total) * 100) 
      : 0;
    const redPercent = voteCounts.total > 0 
      ? Math.round((voteCounts.red / voteCounts.total) * 100) 
      : 0;
    
    return res.json({
      success: true,
      votes: filteredVotes,
      counts: voteCounts,
      bluePercent,
      redPercent,
      total: votes.length
    });
    
  } catch (error) {
    console.error('获取投票错误:', error);
    return res.status(500).json({ error: '服务器错误' });
  }
};