package com.gatiman.enums;

public enum RouteType {
    INTRA_ZONE("Intra-Zone (Local)"),
    INTER_ZONE("Inter-Zone"),
    INTRA_CITY("Intra-City (Local City)"),
    INTER_CITY("Inter-City (Same State)"),
    INTER_STATE("Inter-State (Cross State)");

    private final String displayName;

    RouteType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public boolean isIntra() {
        return this == INTRA_ZONE || this == INTRA_CITY;
    }

    public boolean isInterCity() {
        return this == INTER_ZONE || this == INTER_CITY;
    }

    public boolean isInterState() {
        return this == INTER_STATE;
    }
}
