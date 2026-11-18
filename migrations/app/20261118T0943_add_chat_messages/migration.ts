#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/965b728f1ddd793880be309ee145b69388d8b339c43cd6a4b8ac6e952f47f2e4/contract';
import endContract from '../../snapshots/965b728f1ddd793880be309ee145b69388d8b339c43cd6a4b8ac6e952f47f2e4/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/f1601424688d72af3bec5dc94f028d04f8854d35c5d2e5bbf68b8ded95a6c431/contract';
import startContract from '../../snapshots/f1601424688d72af3bec5dc94f028d04f8854d35c5d2e5bbf68b8ded95a6c431/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, primaryKey, sql } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'chat_messages',
        columns: [
          col('content', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('receiverId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('senderId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createIndex({
        schema: 'public',
        table: 'chat_messages',
        index: 'chat_messages_receiverId_idx_fe124f44',
        columns: ['receiverId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'chat_messages',
        index: 'chat_messages_senderId_idx_4689c490',
        columns: ['senderId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'chat_messages',
        index: 'chat_messages_senderId_receiverId_createdAt_idx_4312a90b',
        columns: ['senderId', 'receiverId', 'createdAt'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'chat_messages',
        foreignKey: {
          name: 'chat_messages_senderId_fkey',
          columns: ['senderId'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'chat_messages',
        foreignKey: {
          name: 'chat_messages_receiverId_fkey',
          columns: ['receiverId'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
