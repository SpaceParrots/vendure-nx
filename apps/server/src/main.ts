import { config, uiExtensionsConfig } from '@vendure-nx/util-config';
import { AdminUiPlugin } from '@vendure/admin-ui-plugin';
import {
  bootstrap,
  JobQueueService,
  mergeConfig,
  runMigrations,
} from '@vendure/core';
import * as path from 'path';

const ADMIN_UI_DEV_MODE = process.env.DEV_ADMIN_UI === 'true';
const PORT = +process.env.API_INTERNAL_PORT || 3000;

const mergedConfig = mergeConfig(config, {
  dbConnectionOptions: {
    migrations: [path.join(__dirname, '../../migrations/*.js')],
  },
  plugins: [
    ...config.plugins,
    AdminUiPlugin.init({
      port: +process.env.API_INTERNAL_PORT + 3,
      route: 'admin',
      adminUiConfig: {
        apiHost: process.env.API_PUBLIC_URL,
        apiPort: +(process.env.API_PUBLIC_PORT as string),
        tokenMethod: 'bearer',
      },
      app: ADMIN_UI_DEV_MODE
        ? require('@vendure/ui-devkit/compiler').compileUiExtensions({
            outputPath: path.join(__dirname, '../__temp-admin-ui'),
            extensions: uiExtensionsConfig,
            devMode: true,
            command: 'npm',
          })
        : {
            path: path.join(__dirname, '../admin-ui/dist/browser'),
          },
    }),
  ],
});

runMigrations(mergedConfig)
  .then(() => bootstrap(mergedConfig))
  .then((app) => {
    if (process.env.RUN_JOB_QUEUE === '1') {
      app.get(JobQueueService).start();
    }
  })
  .catch((err: any) => {
    // tslint:disable-next-line:no-console
    console.log(err);
    process.exit(1);
  });
