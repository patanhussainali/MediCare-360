# Build Notes — MediCare360 Java Backend

## Environment Requirements

- **Java:** JDK 21 (required — Spring Boot 3.2.5 minimum)
- **Maven:** 3.9.x

## Java / Maven Not in PATH

`mvn` and `java` are not present in the system PATH on this machine.
Two portable installations were set up under `C:\dev\`:

| Tool | Location |
|---|---|
| JDK 21 | `C:\dev\java21\jdk-21.0.7+6` |
| Maven 3.9.9 | `C:\dev\maven\apache-maven-3.9.9` |

## How to Build

Open PowerShell and run:

```powershell
$env:JAVA_HOME = "C:\dev\java21\jdk-21.0.7+6"
$env:PATH = "$env:JAVA_HOME\bin;C:\dev\maven\apache-maven-3.9.9\bin;$env:PATH"
cd "c:\Users\SIVA SANKAR\OneDrive\Desktop\medicare-360\java-backend"
mvn compile -q
```

## How to Run Tests

```powershell
mvn test -q
```

## How to Package

```powershell
mvn clean package -DskipTests -q
# Produces: target/medicare360-1.0.0.jar
```

## Permanent PATH Setup (optional)

To make Java and Maven permanently available, add these to your system environment variables:

- Add `C:\dev\java21\jdk-21.0.7+6\bin` to PATH
- Add `C:\dev\maven\apache-maven-3.9.9\bin` to PATH
- Set `JAVA_HOME=C:\dev\java21\jdk-21.0.7+6`

## Build Status

`mvn compile -q` → **BUILD SUCCESS** (FEAT-001 scaffold + security layer)
`mvn test -q`    → **BUILD SUCCESS** (placeholder test passes)
