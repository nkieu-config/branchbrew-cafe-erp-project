import { disconnectPrisma } from './seed/client';
import { runSeed } from './seed/index';

runSeed()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await disconnectPrisma();
  });
