FROM node:24-alpine

ENV NODE_ENV=production
WORKDIR /app

COPY server/package.json server/package-lock.json server/
RUN npm ci --omit=dev --prefix server

COPY server server
COPY src src
COPY data/dicts data/dicts
COPY scripts/build_web.js scripts/build_web.js
RUN node scripts/build_web.js && rm -rf src data scripts

USER node
EXPOSE 3000
ENTRYPOINT ["server/entrypoint.sh"]
CMD ["node", "server/index.js"]
