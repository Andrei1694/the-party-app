package com.party.ceva.demo.service;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@ConditionalOnProperty(name = "file.storage.type", havingValue = "s3")
public class AwsS3FileStorageService implements FileStorageService {
    private static final Logger logger = LoggerFactory.getLogger(AwsS3FileStorageService.class);

    @Override
    public String storeFile(MultipartFile file) {
        logger.info("Uploading file to AWS S3 (simulation)");
        String fileName = file.getOriginalFilename();
        logger.warn("Using simulated S3 storage implementation for file '{}'", fileName);
        // Simulate returning a file URL
        String url = "https://s3.amazonaws.com/your-bucket/" + fileName;
        logger.debug("Returning simulated S3 URL '{}'", url);
        return url;
    }
}
