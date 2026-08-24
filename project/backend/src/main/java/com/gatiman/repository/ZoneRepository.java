package com.gatiman.repository;

import com.gatiman.entity.Zone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ZoneRepository extends JpaRepository<Zone, Long> {
    Optional<Zone> findByCode(String code);
    List<Zone> findByIsActiveTrue();
    List<Zone> findByActiveTrue();
}
