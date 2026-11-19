#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/07a5849b86e423a2910e292f7e7449ac3e6a769cc7a0fb7ef60b197c7ea6e447/contract';
import endContract from '../../snapshots/07a5849b86e423a2910e292f7e7449ac3e6a769cc7a0fb7ef60b197c7ea6e447/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/9fc2d35e282ef90f4383c3a964b359ecd65ab2fb588f19f0fc705f7c074cb932/contract';
import startContract from '../../snapshots/9fc2d35e282ef90f4383c3a964b359ecd65ab2fb588f19f0fc705f7c074cb932/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  col,
  fn,
  lit,
  primaryKey,
  sql,
} from '@prisma/orm-postgres/migration';

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
      this.createTable({
        schema: 'public',
        table: 'users',
        columns: [
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('email', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('isActive', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('passwordHash', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('role', 'text', {
            notNull: true,
            default: lit('STAFF'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('updatedAt', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addColumn({
        schema: 'public',
        table: 'Delivery',
        column: col('paymentPhotoPath', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addUnique({
        schema: 'public',
        table: 'users',
        constraint: 'users_email_key',
        columns: ['email'],
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
