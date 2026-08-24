package com.gatiman.repository;

import com.gatiman.entity.AgentLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AgentLocationRepository extends JpaRepository<AgentLocation, Long> {
    List<AgentLocation> findByAgentIdOrderByRecordedAtDesc(Long agentId);
}
