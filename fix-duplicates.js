const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function check() {
  // 실시간 선박 위치 관련 링크 모두 조회
  const links = await p.shipLink.findMany({
    where: { 
      OR: [
        { title: { contains: 'MTIS' } },
        { title: { contains: '실시간' } },
        { title: { contains: 'PATIS' } },
        { title: { contains: '위치' } }
      ]
    },
    include: { ship: { select: { name: true } } }
  });
  
  // shipId별 그룹핑
  const byShip = {};
  links.forEach(l => {
    if (!byShip[l.shipId]) byShip[l.shipId] = [];
    byShip[l.shipId].push({ id: l.id, title: l.title, shipName: l.ship.name });
  });
  
  let deleted = 0;
  for (const [shipId, shipLinks] of Object.entries(byShip)) {
    if (shipLinks.length > 1) {
      console.log(shipLinks[0].shipName + ': ' + shipLinks.length + '개');
      shipLinks.forEach(l => console.log('  -', l.title, '(' + l.id + ')'));
      // 첫 번째만 남기고 삭제
      for (let i = 1; i < shipLinks.length; i++) {
        await p.shipLink.delete({ where: { id: shipLinks[i].id } });
        deleted++;
      }
    }
  }
  console.log('삭제:', deleted, '개');
}
check().catch(console.error).finally(() => p.$disconnect());
