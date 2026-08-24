package com.gatiman.enums;

public enum Role {
    CUSTOMER,
    DELIVERY_AGENT,
    ADMIN;

    public String toAuthority() {
        return "ROLE_" + this.name();
    }
}
