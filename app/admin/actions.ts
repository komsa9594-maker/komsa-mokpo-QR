'use server';

import { prisma } from '../lib/db';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
  const id = formData.get('id');
  const pw = formData.get('password');
  if (id === 'mokpo9594' && pw === 'mokpo9594!') {
    const cookieStore = await cookies();
    cookieStore.set('admin-auth', 'true', { 
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 1일 유지
    });
  }
  revalidatePath('/admin');
  redirect('/admin');
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('admin-auth');
  revalidatePath('/admin');
}

export async function addShip(formData: FormData) {
  const name = formData.get('name') as string;
  const slug = formData.get('slug') as string;
  if (!name || !slug) return;
  const ship = await prisma.ship.create({
    data: { name, urlSlug: slug }
  });

  // 신규 선박 추가 시 3대 기본 부가 서비스 자동 연동
  await prisma.shipLink.createMany({
    data: [
      { shipId: ship.id, title: '실시간 선박 위치 (MTIS 앱)', url: 'https://play.google.com/store/apps/details?id=kr.or.komsa.mtis&pcampaignid=web_share', icon: 'MapPin' },
      { shipId: ship.id, title: 'VR 여객선 안전체험', url: 'https://www.komsa.or.kr/kor/sub03_021101.do', icon: 'Glasses' },
      { shipId: ship.id, title: '전기차 배터리 안심 점검 서비스', url: 'https://ev-booking-aad7a.web.app/', icon: 'BatteryCharging' }
    ]
  });

  revalidatePath('/admin');
}

export async function updateCoreLink(shipId: string, type: string, url: string) {
  await prisma.ship.update({
    where: { id: shipId },
    data: { [type]: url }
  });
  revalidatePath('/admin');
}

export async function updateWeather(formData: FormData) {
  const txt = formData.get('weather') as string;
  await prisma.systemConfig.upsert({
    where: { id: 'global' },
    create: { id: 'global', tomorrowWeather: txt, totalVisitors: 0 },
    update: { tomorrowWeather: txt }
  });
  revalidatePath('/admin');
}

export async function addCustomLink(shipId: string, title: string, url: string, icon: string = 'ExternalLink', description: string = '', guideText: string = '') {
  await prisma.shipLink.create({
    data: { shipId, title, url, icon, description: description || null, guideText: guideText || null }
  });
  revalidatePath('/admin');
}

export async function addCustomLinkToAllShips(title: string, url: string, icon: string = 'ExternalLink', description: string = '', guideText: string = '') {
  const ships = await prisma.ship.findMany();
  for (const ship of ships) {
    await prisma.shipLink.create({
      data: { shipId: ship.id, title, url, icon, description: description || null, guideText: guideText || null }
    });
  }
  revalidatePath('/admin');
}

export async function copyLinkToOtherShips(linkId: string) {
  const link = await prisma.shipLink.findUnique({ where: { id: linkId } });
  if (!link) return;
  
  const ships = await prisma.ship.findMany({
    where: { id: { not: link.shipId } }
  });
  
  for (const ship of ships) {
    // 중복 방지: 동일한 URL을 가진 링크가 이미 있는지 확인
    const existing = await prisma.shipLink.findFirst({
      where: { shipId: ship.id, url: link.url }
    });
    
    if (!existing) {
      await prisma.shipLink.create({
        data: { 
          shipId: ship.id, 
          title: link.title, 
          url: link.url, 
          icon: link.icon, 
          description: link.description, 
          guideText: link.guideText 
        }
      });
    }
  }
  revalidatePath('/admin');
}

export async function deleteCustomLink(id: string) {
  await prisma.shipLink.delete({ where: { id } });
  revalidatePath('/admin');
}

export async function deleteShip(id: string) {
  await prisma.ship.delete({ where: { id } });
  revalidatePath('/admin');
}

export async function updateShipInfo(shipId: string, data: any) {
  await prisma.ship.update({
    where: { id: shipId },
    data
  });
  revalidatePath('/admin');
}

export async function updateCustomLink(id: string, title: string, url: string, icon: string = 'ExternalLink', description: string = '', guideText: string = '') {
  await prisma.shipLink.update({
    where: { id },
    data: { title, url, icon, description: description || null, guideText: guideText || null }
  });
  revalidatePath('/admin');
  revalidatePath('/');
}

export async function addAnnouncement(title: string, content: string, imageUrl: string | null = null, targetShips: string = 'all') {
  await prisma.announcement.create({
    data: { title, content, imageUrl, targetShips }
  });
  revalidatePath('/admin');
  revalidatePath('/');
}

export async function updateAnnouncement(id: string, title: string, content: string, imageUrl: string | null = null, targetShips: string = 'all') {
  await prisma.announcement.update({
    where: { id },
    data: { title, content, imageUrl, targetShips }
  });
  revalidatePath('/admin');
  revalidatePath('/');
}

export async function deleteAnnouncement(id: string) {
  await prisma.announcement.delete({
    where: { id }
  });
  revalidatePath('/admin');
  revalidatePath('/');
}

export async function toggleAnnouncementActive(id: string, isActive: boolean) {
  await prisma.announcement.update({
    where: { id },
    data: { isActive }
  });
  revalidatePath('/admin');
  revalidatePath('/');
}

