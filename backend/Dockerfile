# Multi-stage build for Spring Boot
FROM eclipse-temurin:17-jdk-alpine AS builder

WORKDIR /app
COPY pom.xml .
COPY src ./src

# Install Maven
RUN apk add --no-cache maven && \
    mvn dependency:go-offline -q && \
    mvn package -DskipTests -q

# Runtime stage
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

RUN addgroup -S apqp && adduser -S apqp -G apqp

COPY --from=builder /app/target/*.jar app.jar

RUN chown apqp:apqp app.jar

USER apqp

EXPOSE 8080

ENTRYPOINT ["java", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-jar", "app.jar"]
