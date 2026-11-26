FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./

FROM base AS deps
RUN apk add --no-cache python3 make g++
RUN npm ci --omit=dev

FROM deps AS test
COPY server.js server.test.js swagger.js ./
COPY public ./public
CMD ["npm", "test"]

FROM base AS production
COPY --from=deps /app/node_modules ./node_modules
COPY server.js swagger.js ./
COPY public ./public
RUN mkdir data && chown node:node data
ENV NODE_ENV=production
ENV PORT=3000
ENV DB_FILE=data/courses.db
ENV CONTAINERIZED=true
USER node
EXPOSE 3000
CMD ["npm", "start"]
