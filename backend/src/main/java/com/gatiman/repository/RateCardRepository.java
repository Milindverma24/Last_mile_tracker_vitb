package com.gatiman.repository;

import com.gatiman.entity.RateCard;
import com.gatiman.enums.CustomerType;
import com.gatiman.enums.RouteType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface RateCardRepository extends JpaRepository<RateCard, Long> {
    Optional<RateCard> findByCustomerTypeAndRouteTypeAndIsActiveTrue(CustomerType customerType, RouteType routeType);
    List<RateCard> findByIsActiveTrue();
}
