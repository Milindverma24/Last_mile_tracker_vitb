package com.gatiman.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "order_packages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderPackage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Column(columnDefinition = "TEXT")
    private String packageDescription;

    @Column(nullable = false, precision = 8, scale = 2)
    private BigDecimal lengthCm;

    @Column(nullable = false, precision = 8, scale = 2)
    private BigDecimal breadthCm;

    @Column(nullable = false, precision = 8, scale = 2)
    private BigDecimal heightCm;

    @Column(precision = 10, scale = 2)
    private BigDecimal declaredValue;
}
