// 内存存储数据
let votes = [];
let voteCounts = { blue: 0, red: 0, total: 0 };

module.exports = async (req, res) => {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // 只处理POST请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '只允许POST请求' });
  }
  
  try {
    const { option, reason, userId, nickname } = req.body;
    
    // 验证输入
    if (!option || !reason) {
      return res.status(400).json({ error: '缺少必要字段' });
    }
    
    if (option !== 'blue' && option !== 'red') {
      return res.status(400).json({ error: '选项无效' });
    }
    
    if (reason.length < 10) {
      return res.status(400).json({ error: '理由至少需要10个字' });
    }
    
    // 生成随机昵称（如果没有提供）
    const generateNickname = () => {
      const adjectives = ['勇敢', '深思', '谨慎', '乐观', '悲观', '理性', '感性', '好奇', '果断', '犹豫'];
      const nouns = ['探险家', '思想家', '观察者', '决策者', '梦想家', '现实主义者', '理想主义者', '哲学家', '科学家', '艺术家'];
      const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
      const noun = nouns[Math.floor(Math.random() * nouns.length)];
      const num = Math.floor(Math.random() * 1000);
      return `${adj}的${noun}${num}`;
    };
    
    const vote = {
      id: Date.now().toString(),
      userId: userId || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      nickname: nickname || generateNickname(),
      option,
      reason,
      timestamp: new Date().toISOString()
    };
    
    // 保存投票
    votes.push(vote);
    voteCounts[option]++;
    voteCounts.total++;
    
    return res.status(201).json({
      success: true,
      message: '投票已提交',
      voteId: vote.id,
      userId: vote.userId,
      nickname: vote.nickname
    });
    
  } catch (error) {
    console.error('投票处理错误:', error);
    return res.status(500).json({ error: '服务器错误' });
  }
};