# Deployment Guide - Multi-Client Process Schema

## Passo a Passo para Deploy

### 1. Backup do Banco de Dados (IMPORTANTE!)

Antes de rodar qualquer migration, faça backup:

```sql
-- No Supabase SQL Editor, rode:
-- (Isso exporta estrutura + dados)
```

Ou use o Dashboard do Supabase: **Database** → **Backups** → **Create Backup**

---

### 2. Rodar a Migration

1. Acesse o **Supabase Dashboard**
2. Vá em **SQL Editor**
3. Clique em **New Query**
4. Copie TODO o conteúdo de `supabase/migrations/create_process_parties_table.sql`
5. Cole no editor
6. Clique em **RUN**

**Tempo estimado**: 5-10 segundos

---

### 3. Verificar Criação da Tabela

```sql
-- Verificar se tabela foi criada
SELECT * FROM process_parties LIMIT 10;

-- Verificar políticas RLS
SELECT * FROM pg_policies WHERE tablename = 'process_parties';

-- Verificar indexes
SELECT indexname FROM pg_indexes WHERE tablename = 'process_parties';
```

**Resultado esperado**:
- Tabela vazia (ou com dados migrados)
- 4 políticas RLS ativas
- 4 indexes criados

---

### 4. Validar Migração de Dados

A migration já inclui migração automática dos dados existentes!

Verifique se funcionou:

```sql
-- Ver quantas partes foram migradas
SELECT 
    COUNT(*) as total_parties,
    role,
    is_client
FROM process_parties
GROUP BY role, is_client;

-- Ver processos com múltiplas partes
SELECT 
    process_id,
    COUNT(*) as num_parties
FROM process_parties
GROUP BY process_id
HAVING COUNT(*) > 1;
```

---

### 5. Testar RLS (Row Level Security)

```sql
-- Como usuário autenticado, deve retornar apenas partes dos seus processos
SELECT * FROM process_parties;

-- Se retornar erro "permission denied", RLS está funcionando!
-- (Isso é esperado se não estiver autenticado)
```

---

### 6. Atualizar Frontend

No código React, as importações já estão prontas:

```typescript
import { useProcessParties } from '../hooks/useProcessParties';
import { ProcessPartiesModal } from '../components/ProcessPartiesModal';
```

**Exemplo de uso em ProcessDetailsModal**:

```tsx
const [showParties, setShowParties] = useState(false);

// No JSX:
<button onClick={() => setShowParties(true)}>
    Ver Partes do Processo
</button>

<ProcessPartiesModal
    isOpen={showParties}
    onClose={() => setShowParties(false)}
    processId={process.id}
    processNumber={process.numero}
/>
```

---

### 7. Troubleshooting

#### Erro: "relation already exists"
**Solução**: Tabela já foi criada antes. Pode ignorar ou dropar primeiro:
```sql
DROP TABLE IF EXISTS process_parties CASCADE;
-- Depois rode a migration novamente
```

#### Erro: "permission denied for table process_parties"
**Solução**: RLS está ativo mas faltam policies. Verifique:
```sql
SELECT * FROM pg_policies WHERE tablename = 'process_parties';
-- Deve retornar 4 policies
```

#### Dados não foram migrados
**Solução**: Rode manualmente a seção 7 da migration:
```sql
-- Veja o arquivo create_process_parties_table.sql, seção 7
```

---

### 8. Rollback (se necessário)

Se algo der errado e você precisar reverter:

```sql
-- 1. Drop view
DROP VIEW IF EXISTS process_clients CASCADE;

-- 2. Drop table (CUIDADO: isso apaga todos os dados!)
DROP TABLE IF EXISTS process_parties CASCADE;

-- 3. Restaurar do backup feito no passo 1
```

---

### 9. Checklist de Validação

- [ ] Backup criado
- [ ] Migration rodada sem erros
- [ ] Tabela `process_parties` existe
- [ ] 4 indexes criados
- [ ] 4 policies RLS ativas
- [ ] Dados existentes migrados (plaintiffs/defendants)
- [ ] View `process_clients` criada
- [ ] Frontend consegue acessar via hook

---

### 10. Próximos Passos (Após Deploy)

1. **Testar UI**: Abra um processo e clique em "Ver Partes"
2. **Adicionar partes manualmente**: Use o modal para adicionar
3. **Vincular clientes**: Teste a vinculação de partes a clientes
4. **Jus.br Integration**: Com schema pronto, pode iniciar integração

---

**Dúvidas?** Consulte os logs do Supabase em **Database** → **Logs**
