#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/07a5849b86e423a2910e292f7e7449ac3e6a769cc7a0fb7ef60b197c7ea6e447/contract';
import endContract from '../../snapshots/07a5849b86e423a2910e292f7e7449ac3e6a769cc7a0fb7ef60b197c7ea6e447/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/965b728f1ddd793880be309ee145b69388d8b339c43cd6a4b8ac6e952f47f2e4/contract';
import startContract from '../../snapshots/965b728f1ddd793880be309ee145b69388d8b339c43cd6a4b8ac6e952f47f2e4/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'Delivery',
        column: col('paymentPhotoPath', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
