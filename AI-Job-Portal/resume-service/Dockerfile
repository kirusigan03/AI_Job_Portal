# Build the jar first: mvn -f resume-service/pom.xml clean package -DskipTests
FROM eclipse-temurin:21-jre

WORKDIR /app

COPY target/*.jar app.jar

EXPOSE 8085

ENTRYPOINT ["java", "-jar", "app.jar"]
