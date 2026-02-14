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
import java.util.UUID;

@Service
@ConditionalOnProperty(name = "file.storage.type", havingValue = "local")
public class LocalFileStorageService implements FileStorageService {
    private final Path fileStorageLocation;

    public LocalFileStorageService() {
        this(Paths.get("./uploads"));
    }

    LocalFileStorageService(Path storagePath) {
        this.fileStorageLocation = storagePath.toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    @Override
    public String storeFile(MultipartFile file) {
        String originalFileName = file.getOriginalFilename();
        String normalizedOriginalFileName = StringUtils.cleanPath(originalFileName == null ? "" : originalFileName);

        try {
            if (!StringUtils.hasText(normalizedOriginalFileName)) {
                throw new RuntimeException("File name is missing.");
            }

            if (normalizedOriginalFileName.contains("..")) {
                throw new RuntimeException("Sorry! Filename contains invalid path sequence " + normalizedOriginalFileName);
            }

            String extension = StringUtils.getFilenameExtension(normalizedOriginalFileName);
            String fileName = UUID.randomUUID() + (StringUtils.hasText(extension) ? "." + extension : "");

            Path targetLocation = this.fileStorageLocation.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return fileName;
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file. Please try again!", ex);
        }
    }
}
