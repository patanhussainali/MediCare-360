FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /src
RUN apk add --no-cache maven
COPY . .
RUN mvn -B -f backend/pom.xml clean package -DskipTests && \
    cp backend/target/medicare360-1.0.0.jar /tmp/app.jar

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /tmp/app.jar app.jar
EXPOSE 8080
ENTRYPOINT ["/bin/sh", "-c", "exec java -jar app.jar --server.port=${PORT:-8080}"]
