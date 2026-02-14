package com.party.ceva.demo.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashSet;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class FileUploadControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Set<Path> createdUploads = new HashSet<>();

    @AfterEach
    void cleanupUploadedFiles() throws Exception {
        for (Path filePath : createdUploads) {
            Files.deleteIfExists(filePath);
        }
        createdUploads.clear();
    }

    @Test
    void uploadImageReturnsJsonWithFileMetadata() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "avatar.png",
                MediaType.IMAGE_PNG_VALUE,
                "profile-image".getBytes(StandardCharsets.UTF_8)
        );

        MvcResult result = mockMvc.perform(multipart("/api/files/upload").file(file).with(user("user@example.com")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fileName").isString())
                .andExpect(jsonPath("$.fileUrl").isString())
                .andExpect(jsonPath("$.fileUrl").value(org.hamcrest.Matchers.containsString("/uploads/")))
                .andReturn();

        JsonNode body = objectMapper.readTree(result.getResponse().getContentAsString());
        String fileName = body.path("fileName").asText();
        assertFalse(fileName.isBlank());
        createdUploads.add(Path.of("uploads").resolve(fileName).toAbsolutePath().normalize());
    }

    @Test
    void uploadRejectsEmptyFile() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "empty.png", MediaType.IMAGE_PNG_VALUE, new byte[0]);

        mockMvc.perform(multipart("/api/files/upload").file(file).with(user("user@example.com")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void uploadRejectsNonImageFile() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "notes.txt",
                MediaType.TEXT_PLAIN_VALUE,
                "plain-text".getBytes(StandardCharsets.UTF_8)
        );

        mockMvc.perform(multipart("/api/files/upload").file(file).with(user("user@example.com")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void uploadGeneratesUniqueFilenamesForSameOriginalName() throws Exception {
        String firstFileName = uploadAndReturnFileName("same-name.png", "first-upload");
        String secondFileName = uploadAndReturnFileName("same-name.png", "second-upload");

        assertNotEquals(firstFileName, secondFileName);
    }

    @Test
    void uploadedFilesArePubliclyAccessible() throws Exception {
        byte[] fileContent = "public-file".getBytes(StandardCharsets.UTF_8);
        String fileName = uploadAndReturnFileName("public-file.png", fileContent);

        mockMvc.perform(get("/uploads/{fileName}", fileName))
                .andExpect(status().isOk())
                .andExpect(content().bytes(fileContent));
    }

    @Test
    void uploadEndpointRequiresAuthentication() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "avatar.png",
                MediaType.IMAGE_PNG_VALUE,
                "profile-image".getBytes(StandardCharsets.UTF_8)
        );

        MvcResult result = mockMvc.perform(multipart("/api/files/upload").file(file))
                .andReturn();

        int statusCode = result.getResponse().getStatus();
        assertTrue(statusCode == 401 || statusCode == 403);
    }

    private String uploadAndReturnFileName(String originalFileName, String content) throws Exception {
        return uploadAndReturnFileName(originalFileName, content.getBytes(StandardCharsets.UTF_8));
    }

    private String uploadAndReturnFileName(String originalFileName, byte[] content) throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", originalFileName, MediaType.IMAGE_PNG_VALUE, content);

        MvcResult result = mockMvc.perform(multipart("/api/files/upload").file(file).with(user("user@example.com")))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode body = objectMapper.readTree(result.getResponse().getContentAsString());
        String fileName = body.path("fileName").asText();
        createdUploads.add(Path.of("uploads").resolve(fileName).toAbsolutePath().normalize());
        return fileName;
    }
}
