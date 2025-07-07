# 使用 OpenJDK 17 作為基礎映像
FROM openjdk:17-jdk-slim

# 設定工作目錄
WORKDIR /app

# 複製 Maven 配置檔案
COPY pom.xml ./

# 複製 Maven wrapper
COPY .mvn .mvn
COPY mvnw ./

# 給予 mvnw 執行權限
RUN chmod +x mvnw

# 下載依賴（利用 Docker 層快取）
RUN ./mvnw dependency:go-offline -B

# 複製原始碼
COPY src ./src

# 編譯應用程式
RUN ./mvnw clean package -DskipTests -B

# 暴露 Render 需要的端口變數
EXPOSE $PORT

# 運行應用程式，使用 Render 提供的 PORT 環境變數
CMD ["sh", "-c", "java -jar -Dserver.port=$PORT target/*.jar"]