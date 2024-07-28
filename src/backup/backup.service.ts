// src/backup/backup.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);

  private readonly dbName = process.env.DB_NAME;
  private readonly dbUser = process.env.DB_USERNAME;
  private readonly dbHost = process.env.DB_HOST;
  private readonly dbPassword = process.env.DB_PASSWORD;
  private readonly backupDir = path.join(__dirname, '..', '..', 'backups');

  constructor() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir);
    }
  }

  async createBackup(): Promise<void> {
    const date = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = `${this.dbName}-${date}.sql`;
    const backupPath = path.join(this.backupDir, backupFile);

    let command: string;

    if (process.platform === 'win32') {
      const tempEnvFile = path.join(this.backupDir, 'pgpass.conf');
      fs.writeFileSync(tempEnvFile, `*:*:*:${this.dbUser}:${this.dbPassword}`);
      process.env.PGPASSFILE = tempEnvFile;
      command = `pg_dump -U ${this.dbUser} -h ${this.dbHost} ${this.dbName} > ${backupPath}`;
    } else {
      command = `PGPASSWORD=${this.dbPassword} pg_dump -U ${this.dbUser} -h ${this.dbHost} ${this.dbName} > ${backupPath}`;
    }

    exec(command, (error) => {
      if (process.platform === 'win32') {
        fs.unlinkSync(path.join(this.backupDir, 'pgpass.conf'));
        delete process.env.PGPASSFILE;
      }

      if (error) {
        this.logger.error(`Error creating local backup: ${error.message}`);
        return;
      }

      this.logger.log(`Local backup created successfully: ${backupPath}`);
    });
  }

  @Cron('0 0 */3 * * *') // Every 3 hours
  async handleCron() {
    if (process.env.NODE_ENV === 'production') {
      this.logger.log('Running scheduled backup task');
      await this.createBackup();
    }
  }
}
