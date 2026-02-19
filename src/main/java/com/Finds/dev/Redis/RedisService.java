package com.Finds.dev.Redis;

import jakarta.persistence.criteria.CriteriaBuilder;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
public class RedisService {

    private final RedisTemplate<String, Object> redisTemplate;

    public RedisService(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public String getUserConfKey(String email) {
        return "user" + ":" + email + ":" + "UNCONFIRMED";
    }

    public void saveValue(String key, Object value, DurationType durationType, int duration) {
        Duration ttl;

        switch (durationType) {
            case S -> ttl = Duration.ofSeconds(duration);
            case M -> ttl = Duration.ofMinutes(duration);
            case H -> ttl = Duration.ofHours(duration);
            case D -> ttl = Duration.ofDays(duration);
            default -> throw new IllegalArgumentException("Unknown DurationType: " + durationType);
        }

        redisTemplate.opsForValue().set(key, value, ttl);
    }

    public Object getValue(String key) {
        return redisTemplate.opsForValue().get(key);
    }
    
    public void incrementValue(String key) {
        redisTemplate.opsForValue().increment(key);
    }
    
    public void incrementValueWithTTL(String key, DurationType durationType, int duration) {
        redisTemplate.opsForValue().increment(key);
        
        switch (durationType) {
            case S -> redisTemplate.expire(key, Duration.ofSeconds(duration));
            case M -> redisTemplate.expire(key, Duration.ofMinutes(duration));
            case H -> redisTemplate.expire(key, Duration.ofHours(duration));
            case D -> redisTemplate.expire(key, Duration.ofDays(duration));
        }
    }

    public void deleteValue(String key) {
        redisTemplate.delete(key);
    }
    
    public boolean exists(String key) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }

    public enum DurationType {
        S, M, H, D
    }
}
