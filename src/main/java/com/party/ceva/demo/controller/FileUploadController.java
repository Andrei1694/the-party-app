package com.party.ceva.demo.controller;

import com.party.ceva.demo.dto.FileUploadResponse;
import com.party.ceva.demo.service.FileStorageService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.Locale;

@RestController
@RequestMapping("/api/files")
public class FileUploadController {

    private final FileStorageService fileStorageService;

    public FileUploadController(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }

    @PostMapping("/upload")
    public ResponseEntity<FileUploadResponse> uploadFile(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is required.");
        }

        String contentType = file.getContentType();
        if (!StringUtils.hasText(contentType) || !contentType.toLowerCase(Locale.ROOT).startsWith("image/")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Image file is required.");
        }

        try {
            String storedReference = fileStorageService.storeFile(file);
            String fileName = extractFileName(storedReference);
            String fileUrl = buildFileUrl(storedReference, fileName);
            return ResponseEntity.ok(new FileUploadResponse(fileName, fileUrl));
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to upload file.", e);
        }
    }

    private String extractFileName(String storedReference) {
        if (!StringUtils.hasText(storedReference)) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Stored file reference is invalid.");
        }

        if (!isAbsoluteUrl(storedReference)) {
            return storedReference;
        }

        URI uri = URI.create(storedReference);
        String path = uri.getPath();
        if (!StringUtils.hasText(path)) {
            return storedReference;
        }

        String[] pathSegments = path.split("/");
        return pathSegments.length > 0 ? pathSegments[pathSegments.length - 1] : storedReference;
    }

    private String buildFileUrl(String storedReference, String fileName) {
        if (isAbsoluteUrl(storedReference)) {
            return storedReference;
        }

        return ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/uploads/")
                .path(fileName)
                .toUriString();
    }

    private boolean isAbsoluteUrl(String value) {
        try {
            URI uri = URI.create(value);
            return uri.isAbsolute();
        } catch (IllegalArgumentException ex) {
            return false;
        }
    }
}
