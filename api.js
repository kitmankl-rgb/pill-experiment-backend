// 红蓝药丸实验后端API
// 使用内存存储数据（注意：重启后会丢失）

// 内存存储
let votes = [];
let voteCounts = { blue: 0, red: 0, total: 0 };

// 生成随机昵称
function generateRandomNickname() {
  const adjectives = ['勇敢', '深思', '謹慎', '樂觀', '悲觀', '理性', '感性', '好奇', '果斷', '猶豫'];
  const nouns = ['探險家', '思想家', '觀察者', '決策者', '夢想家', '現實主義者', '理想主義者', '哲學家', '科學家', '藝術家'];
  
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 1000);
  
  return `${adj}的${noun}${num}`;
}

// 生成用户ID
function generateUserId() {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// 主处理函数
module.exports = async (req, res) => {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // 解析URL
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;
  
  console.log(`请求: ${req.method} ${pathname}`);
  
  try {
    // 根据路径路由
    if (pathname === '/api/vote' && req.method === 'POST') {
      return await handleVote(req, res);
    } else if (pathname === '/api/votes' && req.method === 'GET') {
      return await handleGetVotes(req, res, url);
    } else if (pathname === '/api/stats' && req.method === 'GET') {
      return await handleStats(req, res);
    } else if (pathname === '/' && req.method === 'GET') {
      return await handleRoot(req, res);
    } else {
      return res.status(404).json({ 
        error: '端点不存在',
        availableEndpoints: [
          'GET  /api/stats - 获取统计数据',
          'GET  /api/votes - 获取所有投票',
          'POST /api/vote  - 提交投票'
        ]
      });
    }
  } catch (error) {
    console.error('服务器错误:', error);
    return res.status(500).json({ 
      error: '服务器内部错误',
      message: error.message 
    });
  }
};

// 处理根路径
async function handleRoot(req, res) {
  const bluePercent = voteCounts.total > 0 
    ? Math.round((voteCounts.blue / voteCounts.total) * 100) 
    : 0;
  const redPercent = voteCounts.total > 0 
    ? Math.round((voteCounts.red / voteCounts.total) * 100) 
    : 0;
    
  return res.json({
    message: '红蓝药丸实验后端API',
    endpoints: [
      'GET  /api/stats - 获取统计数据',
      'GET  /api/votes - 获取所有投票',
      'POST /api/vote  - 提交投票'
    ],
    currentStats: {
      blue: voteCounts.blue,
      red: voteCounts.red,
      total: voteCounts.total,
      bluePercent,
      redPercent
    }
  });
}

// 处理投票提交
async function handleVote(req, res) {
  try {
    // 读取请求体
    let body = '';
    for await (const chunk of req) {
      body += chunk;
    }
    
    const data = JSON.parse(body || '{}');
    const { option, reason, userId, nickname } = data;
    
    // 验证输入
    if (!option || !reason) {
      return res.status(400).json({ error: '缺少必要字段: option 或 reason' });
    }
    
    if (option !== 'blue' && option !== 'red') {
      return res.status(400).json({ error: '选项无效，必须是 "blue" 或 "red"' });
    }
    
    if (reason.length < 10) {
      return res.status(400).json({ error: '理由至少需要10个字' });
    }
    
    // 创建投票记录
    const vote = {
      id: Date.now().toString(),
      userId: userId || generateUserId(),
      nickname: nickname || generateRandomNickname(),
      option,
      reason,
      timestamp: new Date().toISOString()
    };
    
    // 保存投票
    votes.push(vote);
    voteCounts[option]++;
    voteCounts.total++;
    
    console.log(`投票已收到: ${option} - ${vote.nickname}`);
    
    return res.status(201).json({
      success: true,
      message: '投票已成功提交',
      voteId: vote.id,
      userId: vote.userId,
      nickname: vote.nickname
    });
    
  } catch (error) {
    console.error('投票处理错误:', error);
    return res.status(500).json({ 
      error: '服务器错误',
      details: error.message 
    });
  }
}

// 处理获取投票
async function handleGetVotes(req, res, url) {
  try {
    const filter = url.searchParams.get('filter');
    const limit = url.searchParams.get('limit');
    
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
    return res.status(500).json({ 
      error: '服务器错误',
      details: error.message 
    });
  }
}

// 处理获取统计数据
async function handleStats(req, res) {
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
    return res.status(500).json({ 
      error: '服务器错误',
      details: error.message 
    });
  }
}