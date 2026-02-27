# syntax=docker/dockerfile:1

FROM maven:3.9.11-eclipse-temurin-17 AS build
WORKDIR /app

COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw

COPY src/ src/
RUN ./mvnw -DskipTests package \
    && JAR_FILE="$(ls target/*.jar | head -n 1)" \
    && cp "$JAR_FILE" /app/app.jar

FROM eclipse-temurin:17-jre-jammy AS runtime
WORKDIR /app

RUN mkdir -p /app/uploads
COPY --from=build /app/app.jar /app/app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
