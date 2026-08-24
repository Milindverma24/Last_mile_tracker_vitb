package com.gatiman.enums;

public enum EmailEventType {
    ORDER_CREATED("Order Created"),
    ORDER_CONFIRMED("Order Confirmed"),
    AGENT_ASSIGNED("Delivery Partner Assigned"),
    ORDER_PREPARING("Order Preparing / Processing"),
    ORDER_READY("Order Ready for Pickup"),
    PICKED_UP("Delivery Partner Picked Up Order"),
    ON_THE_WAY("Delivery Started / On the Way"),
    OUT_FOR_DELIVERY("Out for Delivery"),
    NEAR_DESTINATION("Delivery Partner Near Destination"),
    DELIVERED("Delivery Completed"),
    DELIVERY_CANCELLED("Delivery Cancelled"),
    DELIVERY_DELAYED("Delivery Delayed"),
    DELIVERY_FAILED("Delivery Attempt Failed"),
    RESCHEDULE_APPROVED("Delivery Rescheduled"),
    RESCHEDULE_REJECTED("Reschedule Request Rejected"),
    WELCOME("Welcome to GATIMAN Delivery Network");

    private final String displayName;

    EmailEventType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
