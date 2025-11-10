FROM node AS build
WORKDIR /app
# COPY package*.json ./
# COPY pnpm-workspace.yaml ./
# # COPY pnpm-lock.yaml ./
# COPY .npmrc ./
# COPY base ./
COPY . ./

RUN rm /app/pnpm-lock.yaml

# 设置 node 阿里镜像
RUN npm config set registry https://registry.npmmirror.com

# 设置内存限制为16G
ENV NODE_OPTIONS=--max-old-space-size=16384

# RUN pnpm config set registry=https://registry.npmmirror.com 

RUN npm install pnpm -g && \
    pnpm install && \
    pnpm build

FROM nginx
COPY --from=build /app/dist /usr/share/nginx/html
COPY --from=build /app/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80