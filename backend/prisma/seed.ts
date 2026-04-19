import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create a Route
  const route = await prisma.route.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Campus Loop A',
      waypoints: [
        { lat: 34.0522, lng: -118.2437 },
        { lat: 34.0530, lng: -118.2450 },
        { lat: 34.0540, lng: -118.2460 },
        { lat: 34.0550, lng: -118.2440 },
        { lat: 34.0522, lng: -118.2437 }
      ]
    }
  });

  console.log(`Route created: ${route.name}`);

  // 2. Create Stops for the Route
  const stopsData = [
    { name: 'Library (North Entrance)', lat: 34.0522, lng: -118.2437, sequence: 1 },
    { name: 'Student Union Building', lat: 34.0530, lng: -118.2450, sequence: 2 },
    { name: 'Science Complex', lat: 34.0540, lng: -118.2460, sequence: 3 },
    { name: 'Engineering Block', lat: 34.0550, lng: -118.2440, sequence: 4 }
  ];

  await prisma.stop.deleteMany({
    where: { route_id: route.id }
  });

  for (const stop of stopsData) {
    const s = await prisma.stop.create({
      data: {
        route_id: route.id,
        name: stop.name,
        lat: stop.lat,
        lng: stop.lng,
        sequence: stop.sequence
      }
    });
    console.log(`Stop created: ${s.name}`);
  }

  // 3. Create a Bus
  const bus = await prisma.bus.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      route_id: route.id,
      plate: 'IZUM-01'
    }
  });

  // 4. Create Demo User
  const crypto = require('crypto');
  const bcrypt = require('bcrypt');

  const hashed_password = await bcrypt.hash('Demo@1234', 12);
  const demoUserId = '00000000-0000-0000-0000-000000000003';
  
  const user = await prisma.user.upsert({
    where: { email: 'demo@campus.edu' },
    update: {},
    create: {
      id: demoUserId,
      email: 'demo@campus.edu',
      hashed_password: hashed_password,
      role: 'student',
      verified: true
    }
  });

  await prisma.student.upsert({
    where: { user_id: user.id },
    update: {},
    create: {
      user_id: user.id,
      name: 'Demo Student',
      college_id_hash: crypto.createHash('sha256').update('DEMO123').digest('hex')
    }
  });
  console.log(`Demo user created: demo@campus.edu`);

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
