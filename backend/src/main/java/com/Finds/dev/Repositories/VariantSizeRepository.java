package com.Finds.dev.Repositories;

import com.Finds.dev.Entity.VariantSize;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VariantSizeRepository extends JpaRepository<VariantSize, String> {
    List<VariantSize> findByVariantId(String variantId);
}
