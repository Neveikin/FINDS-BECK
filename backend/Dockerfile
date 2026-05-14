# Используем официальный образ OpenJDK 17
FROM openjdk:17-jdk-slim

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем Maven wrapper и pom.xml
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Скачиваем зависимости
RUN ./mvnw dependency:go-offline

# Копируем исходный код
COPY src ./src

# Собираем приложение
RUN ./mvnw clean package -DskipTests

# Открываем порт 8090
EXPOSE 8090

# Запускаем приложение
CMD ["java", "-jar", "target/FINDS-BECK-0.0.1-SNAPSHOT.jar"]
