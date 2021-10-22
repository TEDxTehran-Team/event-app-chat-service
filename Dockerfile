# --------------> The build image
FROM node:14 AS build
WORKDIR /usr/src/app
COPY package*.json /usr/src/app/
RUN --mount=type=cache,target=/usr/src/app/.npm npm set cache /usr/src/app/.npm && npm ci -only=production
 
# --------------> The production image
FROM node:14-alpine
RUN apk add dumb-init curl
ENV NODE_ENV production
USER node
WORKDIR /usr/src/app
COPY --chown=node:node --from=build /usr/src/app/node_modules /usr/src/app/node_modules
COPY --chown=node:node . /usr/src/app
CMD ["dumb-init", "node", "server.js"]