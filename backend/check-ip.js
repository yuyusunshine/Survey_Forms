import https from 'https';

console.log('正在获取你的公网IP地址...\n');

https.get('https://api.ipify.org?format=json', (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const ip = JSON.parse(data).ip;
      console.log('═══════════════════════════════════════════════════════');
      console.log('你的公网IP地址是: ' + ip);
      console.log('═══════════════════════════════════════════════════════\n');
      
      console.log('请按以下步骤添加防火墙规则:\n');
      console.log('1. 登录 Azure Portal (https://portal.azure.com)');
      console.log('2. 找到你的 PostgreSQL 服务器: nnsurvey');
      console.log('3. 在左侧菜单点击 "网络" (Networking)');
      console.log('4. 在 "防火墙规则" 部分，点击 "+ 添加客户端IP"');
      console.log('   或者手动添加规则:');
      console.log('   - 规则名称: MyLocalIP');
      console.log(`   - 起始IP: ${ip}`);
      console.log(`   - 结束IP: ${ip}`);
      console.log('5. 点击 "保存" 并等待1-2分钟生效');
      console.log('\n或者临时允许所有IP (仅用于测试):');
      console.log('   - 勾选 "允许来自Azure服务和资源的公共访问"');
      console.log('\n保存后请重新运行: npm start\n');
    } catch (error) {
      console.error('解析IP失败:', error.message);
    }
  });
}).on('error', (error) => {
  console.error('获取IP失败:', error.message);
  console.log('\n手动查看你的IP地址: https://www.whatismyip.com/');
});
