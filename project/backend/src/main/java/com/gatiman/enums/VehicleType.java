package com.gatiman.enums;

public enum VehicleType {
    BIKE(5.0, 40.0, "Motorbike (Two-Wheeler)", "Up to 5 kg (Light parcels, documents)"),
    EV_SCOOTER(5.0, 40.0, "EV Scooter (Two-Wheeler)", "Up to 5 kg (Lightweight eco delivery)"),
    CAR(25.0, 80.0, "Four-Wheeler / Car", "Up to 25 kg (Medium boxes, multiple parcels)"),
    VAN(25.0, 100.0, "Cargo Van", "Up to 25 kg (Bulk boxes, mid-size packages)"),
    TEMPO(150.0, 200.0, "Cargo Tempo / Mini Truck", "Up to 150 kg (Heavy commercial & freight)"),
    TRUCK(500.0, 400.0, "Heavy Freight Truck", "Up to 500+ kg (Industrial heavy load)");

    private final double maxWeightKg;
    private final double maxDimensionCm;
    private final String displayName;
    private final String description;

    VehicleType(double maxWeightKg, double maxDimensionCm, String displayName, String description) {
        this.maxWeightKg = maxWeightKg;
        this.maxDimensionCm = maxDimensionCm;
        this.displayName = displayName;
        this.description = description;
    }

    public double getMaxWeightKg() {
        return maxWeightKg;
    }

    public double getMaxDimensionCm() {
        return maxDimensionCm;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }

    public boolean canCarry(double weightKg, double maxDimCm) {
        return this.maxWeightKg >= weightKg && this.maxDimensionCm >= maxDimCm;
    }

    public static VehicleType getRequiredVehicleType(double weightKg, double maxDimCm) {
        if (weightKg <= 5.0 && maxDimCm <= 40.0) {
            return BIKE;
        } else if (weightKg <= 25.0 && maxDimCm <= 80.0) {
            return CAR;
        } else if (weightKg <= 150.0 && maxDimCm <= 200.0) {
            return TEMPO;
        } else {
            return TRUCK;
        }
    }
}
