FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /src
RUN apk add --no-cache maven
COPY . .
RUN if [ -f java-backend/pom.xml ]; then \
      mvn -B -f java-backend/pom.xml clean package -DskipTests && cp java-backend/target/medicare360-1.0.0.jar /tmp/app.jar; \
    else \
      mvn -B -f pom.xml clean package -DskipTests && cp target/medicare360-1.0.0.jar /tmp/app.jar; \
    fi

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /tmp/app.jar app.jar
EXPOSE 8000
ENTRYPOINT ["/bin/sh", "-c", "exec java -jar app.jar --server.port=${PORT:-8000}"]
