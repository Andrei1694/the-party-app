package com.party.ceva.demo.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Date;
import java.util.Map;

@Service
public class JwtService {
    private static final Logger logger = LoggerFactory.getLogger(JwtService.class);

    private final Key signingKey;
    private final long expirationMs;

    public JwtService(
        @Value("${app.jwt.secret}") String secret,
        @Value("${app.jwt.expiration-ms}") long expirationMs
    ) {
        this.signingKey = Keys.hmacShaKeyFor(normalizeKeyBytes(secret));
        this.expirationMs = expirationMs;
        logger.info("Initialized JWT service with expiration={}ms", expirationMs);
    }

    public String generateToken(Authentication authentication) {
        Object principal = authentication.getPrincipal();
        String username = principal instanceof UserDetails userDetails
            ? userDetails.getUsername()
            : authentication.getName();
        logger.debug("Generating JWT token for authenticated principal {}", username);
        return generateTokenFromUsername(username);
    }

    public String generateTokenFromUsername(String username) {
        logger.debug("Generating JWT token for username {}", username);
        return buildToken(Map.of(), username);
    }

    public String extractUsername(String token) {
        String subject = extractAllClaims(token).getSubject();
        logger.debug("Extracted username {} from JWT token", subject);
        return subject;
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        String username = extractUsername(token);
        boolean isValid = username.equals(userDetails.getUsername()) && !isTokenExpired(token);
        logger.debug("JWT validation for user {} -> {}", userDetails.getUsername(), isValid);
        return isValid;
    }

    private String buildToken(Map<String, Object> extraClaims, String subject) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);
        return Jwts.builder()
            .setClaims(extraClaims)
            .setSubject(subject)
            .setIssuedAt(now)
            .setExpiration(expiry)
            .signWith(signingKey, SignatureAlgorithm.HS256)
            .compact();
    }

    private boolean isTokenExpired(String token) {
        Date expiration = extractAllClaims(token).getExpiration();
        return expiration.before(new Date());
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
            .setSigningKey(signingKey)
            .build()
            .parseClaimsJws(token)
            .getBody();
    }

    private static byte[] normalizeKeyBytes(String secret) {
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length >= 32) {
            return keyBytes;
        }
        logger.warn("Configured JWT secret is shorter than 32 bytes; deriving SHA-256 key material");
        try {
            return MessageDigest.getInstance("SHA-256").digest(keyBytes);
        } catch (NoSuchAlgorithmException ex) {
            logger.error("SHA-256 is unavailable for JWT key derivation", ex);
            throw new IllegalStateException("SHA-256 not available for JWT key derivation", ex);
        }
    }
}
