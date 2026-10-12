import { getDb, migrate, type MigrationReport } from '@/db/index.ts'

/**
 * Garante que o esquema está aplicado uma única vez por processo.
 * As rotas chamam `ensureDb()` antes de tocar em SQL: assim `npm run dev` funciona
 * sem passos prévios, mas o custo de migração não se repete a cada pedido.
 */
let task: Promise<MigrationReport> | null = null

export function ensureDb(): Promise<MigrationReport> {
  if (!task) {
    task = getDb()
      .then((db) => migrate(db))
      .catch((error) => {
        task = null
        throw error
      })
  }
  return task
}

/** Só para testes: força a próxima chamada a voltar a migrar. */
export function resetBootstrap(): void {
  task = null
}
