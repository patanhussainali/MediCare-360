FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app/java-backend
RUN apk add --no-cache maven
COPY java-backend/pom.xml ./pom.xml
COPY java-backend/src ./src
RUN mvn -B clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/java-backend/target/medicare360-1.0.0.jar app.jar
EXPOSE 8000
ENTRYPOINT ["sh", "-c", "java -jar app.jar --server.port=${PORT:-8000}"]

