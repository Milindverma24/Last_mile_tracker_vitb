package com.gatiman.repository;

import com.gatiman.entity.RateCardRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RateCardRuleRepository extends JpaRepository<RateCardRule, Long> {
    List<RateCardRule> findByRateCardId(Long rateCardId);
}
