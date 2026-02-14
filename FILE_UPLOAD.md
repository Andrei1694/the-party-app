### High-Level Overview

The process involves these key steps:
1.  **Client-Side**: A user selects a file using an HTML form and submits it to the server.
2.  **Backend Controller**: A Spring `@RestController` receives the file as a `MultipartFile` object.
3.  **Backend Service**: A `@Service` class contains the business logic to process the file (e.g., validate it, and decide where to save it).
4.  **Storage**: The file is saved to a persistent location, such as the local filesystem, a database, or a cloud storage service (like AWS S3).

---

### Step 1: Configure Multipart Properties

First, you need to configure how Spring handles multipart requests (file uploads). While defaults exist, it's good practice to explicitly define limits in your `src/main/resources/application.properties`:

```properties
# Enable multipart uploads
spring.servlet.multipart.enabled=true

# Set the maximum size for a single file (e.g., 10MB)
spring.servlet.multipart.max-file-size=10MB

# Set the maximum size for the entire request (including multiple files and other form data)
spring.servlet.multipart.max-request-size=10MB
```

### Step 2: Create the Controller Endpoint

Create a controller with a `@PostMapping` endpoint to handle the incoming file. The key is to use the `@RequestParam("file") MultipartFile file` annotation to bind the uploaded file from the request to a `MultipartFile` object.

```java
// src/main/java/com/party/ceva/demo/controller/FileUploadController.java
package com.party.ceva.demo.controller;

import com.party.ceva.demo.service.FileStorageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/files")
public class FileUploadController {

    private final FileStorageService fileStorageService;

    public FileUploadController(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }

    @PostMapping("/upload")
    public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            String fileName = fileStorageService.storeFile(file);
            // Return a success response with the filename
            return ResponseEntity.ok("File uploaded successfully: " + fileName);
        } catch (Exception e) {
            // Return an error response
            return ResponseEntity.status(500).body("Failed to upload file: " + e.getMessage());
        }
    }
}
```

### Step 3: Implement the Storage Service

This service contains the core logic for handling the file. The most common approach for simple applications is saving to the local filesystem.

Here is an example of a service that stores the file in a specified directory.

```java
// src/main/java/com/party/ceva/demo/service/FileStorageService.java
package com.party.ceva.demo.service;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Objects;

@Service
public class FileStorageService {

    private final Path fileStorageLocation;

    public FileStorageService() {
        // Define the path to the upload directory.
        // You can also externalize this path in application.properties
        this.fileStorageLocation = Paths.get("./uploads").toAbsolutePath().normalize();

        try {
            // Create the directory if it doesn't exist
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    public String storeFile(MultipartFile file) {
        // 1. Normalize file name to prevent security vulnerabilities
        String fileName = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));

        try {
            // 2. Check for invalid characters
            if (fileName.contains("..")) {
                throw new RuntimeException("Sorry! Filename contains invalid path sequence " + fileName);
            }

            // 3. Define the target path
            Path targetLocation = this.fileStorageLocation.resolve(fileName);

            // 4. Copy the file to the target location (this will replace an existing file with the same name)
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return fileName;
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + fileName + ". Please try again!", ex);
        }
    }
}
```
**Explanation of `FileStorageService`:**
- **Constructor**: It creates the `uploads` directory in the project's root folder if it doesn't already exist.
- **`storeFile` method**:
    1.  **Security**: It uses `StringUtils.cleanPath()` to sanitize the filename, removing any ".." sequences to prevent path traversal attacks.
    2.  **Target Location**: It resolves the full path where the file will be saved.
    3.  **Save File**: `Files.copy()` reads the `InputStream` from the `MultipartFile` and writes it to the target location on the filesystem.

### Step 4: Client-Side Form

To test this, you would need a simple HTML form. The most important attribute is `enctype="multipart/form-data"`, which tells the browser how to encode the form data to include the file binary.

```html
<!DOCTYPE html>
<html>
<head>
    <title>File Upload</title>
</head>
<body>
    <h1>Spring Boot File Upload</h1>
    <form method="POST" action="/api/files/upload" enctype="multipart/form-data">
        <input type="file" name="file" />
        <button type="submit">Upload</button>
    </form>
</body>
</html>
```

### Alternative Storage Strategies

- **Database Storage**: You can store the file's byte array (`byte[]`) directly in a database table column of type `BLOB` or `bytea`. To do this, you would create a JPA entity and save `file.getBytes()` to a field in that entity. This is simpler but can make your database large and slow.
- **Cloud Storage (Recommended for Production)**: For scalable applications, upload files to a service like **AWS S3**, **Google Cloud Storage**, or **Azure Blob Storage**. This involves adding the respective cloud provider's SDK to your project, configuring credentials, and using their API to upload the file's stream. This approach is more robust, scalable, and decouples file storage from your application server.

---
### Advanced: Managing Multiple File Storage Services (OOP Best Practices)

To learn OOP, it's crucial to build flexible and maintainable systems. What if you need to switch from saving files locally to saving them in the cloud (like AWS S3)? You shouldn't have to change your controller or other parts of your application. This is where the **Strategy Design Pattern** comes in, and it relies on a core OOP principle: **"Program to an interface, not an implementation."**

#### Step 1: Create a `FileStorageService` Interface

First, turn `FileStorageService` into an `interface`. This defines a contract that all storage strategies must follow. Any class that knows how to store a file will `implement` this interface.

```java
// src/main/java/com/party/ceva/demo/service/FileStorageService.java
package com.party.ceva.demo.service;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {
    String storeFile(MultipartFile file);
}
```

#### Step 2: Create Concrete Implementations (Strategies)

Now, create separate classes for each storage strategy, with each one implementing the `FileStorageService` interface.

**A. Local Storage Strategy**

This is the logic we had before, now moved into its own class. Note the annotations: `@Service` and `@ConditionalOnProperty`.

```java
// src/main/java/com/party/ceva/demo/service/LocalFileStorageService.java
package com.party.ceva.demo.service;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Objects;

@Service
@ConditionalOnProperty(name = "file.storage.type", havingValue = "local")
public class LocalFileStorageService implements FileStorageService {
    // ... (same logic as the original FileStorageService class)
}
```

**B. Cloud Storage Strategy (Example)**

Here is a placeholder for a cloud service. It implements the same interface, but its `storeFile` method would contain logic to upload to a service like AWS S3.

```java
// src/main/java/com/party/ceva/demo/service/AwsS3FileStorageService.java
package com.party.ceva.demo.service;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@ConditionalOnProperty(name = "file.storage.type", havingValue = "s3")
public class AwsS3FileStorageService implements FileStorageService {

    @Override
    public String storeFile(MultipartFile file) {
        // In a real application, you would add the AWS S3 SDK
        // and write logic here to upload the file to an S3 bucket.
        System.out.println("Uploading file to AWS S3 (simulation)...");
        String fileName = file.getOriginalFilename();
        // Simulate returning a file URL
        return "https://s3.amazonaws.com/your-bucket/" + fileName;
    }
}
```

#### Step 3: Configure the Active Strategy

The magic happens with the `@ConditionalOnProperty` annotation. Spring will only create a bean for the class that matches the property in `application.properties`.

Now you can easily switch between storage strategies by changing one line:

**To use local storage:**
```properties
# src/main/resources/application.properties
file.storage.type=local
```

**To use AWS S3 storage:**
```properties
# src/main/resources/application.properties
file.storage.type=s3
```

#### Step 4: No Changes Needed in the Controller

Your `FileUploadController` remains unchanged. It depends on the `FileStorageService` **interface**, not a specific class.

```java
public class FileUploadController {

    // Spring injects the active implementation (Local or S3) based on the property.
    private final FileStorageService fileStorageService;

    public FileUploadController(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }
    // ...
}
```

### Summary of OOP Best Practices Applied

1.  **Programming to an Interface**: The `FileUploadController` is coupled to the `FileStorageService` interface only, not to the details of local or S3 storage.
2.  **Dependency Inversion Principle**: The high-level `FileUploadController` does not depend on low-level storage details. Both depend on the `FileStorageService` abstraction.
3.  **Open/Closed Principle**: The system is **open** to extension (you can add a `GoogleCloudStorageService` without changing existing code) but **closed** for modification (the controller never needs to change to support a new storage type).
4.  **Single Responsibility Principle**: Each class has one job. `LocalFileStorageService` only knows about the local filesystem. `AwsS3FileStorageService` only knows about S3. The controller only knows about handling web requests.