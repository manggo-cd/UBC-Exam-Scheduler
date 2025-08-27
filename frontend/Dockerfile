# --- Build stage ---
    FROM node:18-alpine AS build
    WORKDIR /app
    COPY package*.json ./
    RUN npm ci
    COPY . .
    # Inject API base at build if needed: VITE_API_BASE_URL or REACT_APP_API_BASE_URL
    # Default is relative '/api' so no env required
    RUN npm run build
    
    # --- Runtime: nginx ---
    FROM nginx:1.25-alpine
    COPY --from=build /app/dist /usr/share/nginx/html
    COPY nginx.conf /etc/nginx/conf.d/default.conf
    EXPOSE 80
    CMD ["nginx","-g","daemon off;"]
    