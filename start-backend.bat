@echo off
set JAVA_HOME=C:\Users\admin\JavaOOP\Library_System\backend\jdk17\jdk17.0.19_10
set PATH=%JAVA_HOME%\bin;%PATH%
cd C:\Users\admin\JavaOOP\Library_System\backend
.\apache-maven-3.9.6\bin\mvn spring-boot:run "-Dspring-boot.run.profiles=dev"
