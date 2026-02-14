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
