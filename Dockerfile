# ─────────────────────────────────────────────
# Estágio 1 — Dependências
# ─────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

# Copiar apenas os arquivos de dependências primeiro (aproveitando cache do Docker)
COPY app/package.json ./

# Instalar somente dependências de produção
RUN npm install --omit=dev

# ─────────────────────────────────────────────
# Estágio 2 — Imagem final
# ─────────────────────────────────────────────
FROM node:20-alpine

# Metadados da imagem
LABEL maintainer="SI - Cloud Computing"
LABEL description="ChatApp - Infraestrutura Multicontainer"
LABEL version="1.0.0"

# Criar usuário não-root para segurança
RUN addgroup -S chatgroup && adduser -S chatuser -G chatgroup

WORKDIR /app

# Copiar dependências do estágio anterior
COPY --from=deps /app/node_modules ./node_modules

# Copiar código-fonte da aplicação
COPY app/ ./

# Alterar proprietário dos arquivos
RUN chown -R chatuser:chatgroup /app

# Usar usuário não-root
USER chatuser

# Expor a porta da aplicação
EXPOSE 3000

# Variáveis de ambiente padrão (podem ser sobrescritas)
ENV NODE_ENV=production \
    PORT=3000

# Health check da aplicação
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Comando para iniciar a aplicação
CMD ["node", "server.js"]
