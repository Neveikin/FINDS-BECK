package com.Finds.dev.Repositories;

import com.Finds.dev.Entity.VariantImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VariantImageRepository extends JpaRepository<VariantImage, String> {
    List<VariantImage> findByVariantIdOrderByOrderAsc(String variantId);
}
