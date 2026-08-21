package com.gatiman.service;

import com.gatiman.entity.DeliveryAgent;
import com.gatiman.entity.Order;
import com.gatiman.enums.EmailEventType;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
public class EmailTemplateService {

    private static final String BRAND_PRIMARY = "#4F46E5";
    private static final String BRAND_PRIMARY_DARK = "#3730A3";
    private static final String SUCCESS_COLOR = "#10B981";
    private static final String WARNING_COLOR = "#F59E0B";
    private static final String DANGER_COLOR = "#EF4444";
    private static final String BG_COLOR = "#F8FAFC";
    private static final String CARD_BG = "#FFFFFF";
    private static final String TEXT_PRIMARY = "#0F172A";
    private static final String TEXT_SECONDARY = "#64748B";
    private static final String BORDER_COLOR = "#E2E8F0";

    public String generateEmailSubject(EmailEventType eventType, Order order) {
        String trackingNum = order != null ? order.getTrackingNumber() : "Order";
        return switch (eventType) {
            case ORDER_CREATED -> "Order #" + trackingNum + " Created & Registered";
            case ORDER_CONFIRMED -> "Order #" + trackingNum + " Confirmed";
            case AGENT_ASSIGNED -> "Delivery Partner Assigned for Order #" + trackingNum;
            case ORDER_PREPARING -> "Your Order #" + trackingNum + " is Being Prepared";
            case ORDER_READY -> "Order #" + trackingNum + " is Ready for Pickup";
            case PICKED_UP -> "Your Order #" + trackingNum + " Has Been Picked Up 📦";
            case ON_THE_WAY, OUT_FOR_DELIVERY -> "Your Order #" + trackingNum + " is On The Way 🚚";
            case NEAR_DESTINATION -> "Your Delivery for Order #" + trackingNum + " is Almost Here! 📍";
            case DELIVERED -> "Your Order #" + trackingNum + " Has Been Delivered 🎉";
            case DELIVERY_CANCELLED -> "Order #" + trackingNum + " Has Been Cancelled";
            case DELIVERY_DELAYED -> "Your Delivery #" + trackingNum + " is Taking a Little Longer ⏱️";
            case DELIVERY_FAILED -> "Delivery Attempt Notice for Order #" + trackingNum;
            case RESCHEDULE_APPROVED -> "Delivery Rescheduled for Order #" + trackingNum;
            case RESCHEDULE_REJECTED -> "Reschedule Request Notice for Order #" + trackingNum;
        };
    }

    public String buildHtmlEmail(
            EmailEventType eventType,
            Order order,
            String recipientName,
            Double distanceRemaining,
            Integer etaMinutes,
            String customMessage,
            String baseUrl
    ) {
        String trackingNum = order != null ? order.getTrackingNumber() : "GTM-SAMPLE-000000";
        String trackUrl = (baseUrl != null ? baseUrl : "http://localhost:5173") + "/track/" + trackingNum;
        String customerName = recipientName != null && !recipientName.isBlank() ? recipientName : "Valued Customer";

        String heroIcon = getHeroIcon(eventType);
        String heroTitle = getHeroTitle(eventType, trackingNum);
        String heroDescription = getHeroDescription(eventType, customerName, customMessage, order, etaMinutes);
        String statusBadgeText = getStatusBadgeText(eventType);
        String statusBadgeColor = getStatusBadgeColor(eventType);
        String progressTimelineHtml = buildTimelineHtml(eventType);
        String orderCardHtml = buildOrderCardHtml(order, trackingNum, etaMinutes, distanceRemaining, statusBadgeText, statusBadgeColor);
        String addressCardHtml = buildAddressCardHtml(order);
        String partnerCardHtml = buildDeliveryPartnerCardHtml(order);

        return """
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>%s</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td { font-family: Arial, Helvetica, sans-serif !important; }
  </style>
  <![endif]-->
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: %s;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: %s;
      -webkit-font-smoothing: antialiased;
    }
    table { border-collapse: separate; }
    a { color: %s; text-decoration: none; }
    .btn-track {
      background-color: %s;
      color: #ffffff !important;
      font-weight: 700;
      text-decoration: none;
      padding: 14px 28px;
      border-radius: 12px;
      display: inline-block;
      letter-spacing: 0.5px;
      box-shadow: 0 4px 14px rgba(79, 70, 229, 0.35);
    }
    @media only screen and (max-width: 620px) {
      .container-table { width: 100%% !important; }
      .mobile-padding { padding: 20px 16px !important; }
      .timeline-col { display: block !important; width: 100%% !important; margin-bottom: 12px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: %s;">
  <center style="width: 100%%; background-color: %s; padding: 32px 0;">
    <!-- Main Container -->
    <table class="container-table" border="0" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; width: 100%%; background-color: %s; border-radius: 20px; overflow: hidden; border: 1px solid %s; box-shadow: 0 10px 25px rgba(15, 23, 42, 0.06);">
      
      <!-- Brand Header -->
      <tr>
        <td style="background-color: %s; padding: 24px 32px; text-align: center; border-bottom: 1px solid #3730A3;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%%">
            <tr>
              <td align="center">
                <table border="0" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="background-color: #ffffff; width: 36px; height: 36px; border-radius: 10px; text-align: center; vertical-align: middle; font-size: 20px;">
                      🚚
                    </td>
                    <td style="padding-left: 12px; text-align: left;">
                      <div style="color: #ffffff; font-size: 20px; font-weight: 900; letter-spacing: 1px; line-height: 1;">GATIMAN</div>
                      <div style="color: #C7D2FE; font-size: 10px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; margin-top: 3px;">High-Speed Last-Mile Logistics</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Hero Section -->
      <tr>
        <td class="mobile-padding" style="padding: 36px 36px 24px 36px; text-align: center; background-color: #ffffff;">
          <div style="display: inline-block; width: 64px; height: 64px; line-height: 64px; border-radius: 50%%; background-color: #EEF2FF; border: 2px solid #E0E7FF; font-size: 32px; margin-bottom: 16px;">
            %s
          </div>
          <h1 style="margin: 0 0 10px 0; color: %s; font-size: 24px; font-weight: 800; line-height: 1.25;">
            %s
          </h1>
          <p style="margin: 0; color: %s; font-size: 15px; line-height: 1.6; max-width: 480px; display: inline-block;">
            %s
          </p>
        </td>
      </tr>

      <!-- Order Details Card -->
      <tr>
        <td class="mobile-padding" style="padding: 0 36px 24px 36px;">
          %s
        </td>
      </tr>

      <!-- Progress Timeline -->
      <tr>
        <td class="mobile-padding" style="padding: 0 36px 24px 36px;">
          %s
        </td>
      </tr>

      <!-- Primary Action CTA Button -->
      <tr>
        <td style="padding: 8px 36px 28px 36px; text-align: center;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%%">
            <tr>
              <td align="center">
                <a href="%s" target="_blank" class="btn-track">
                  TRACK MY DELIVERY &nbsp;➔
                </a>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-top: 10px;">
                <span style="font-size: 11px; color: %s;">
                  Live GPS telemetry updates in real time on authenticated portal
                </span>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Address Card -->
      <tr>
        <td class="mobile-padding" style="padding: 0 36px 24px 36px;">
          %s
        </td>
      </tr>

      <!-- Delivery Partner Card (if available) -->
      %s

      <!-- Help & Support Strip -->
      <tr>
        <td class="mobile-padding" style="padding: 20px 36px; background-color: #F1F5F9; border-top: 1px solid %s; border-bottom: 1px solid %s;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%%">
            <tr>
              <td style="font-size: 13px; color: %s; line-height: 1.5;">
                <strong style="color: %s;">Need assistance with your delivery?</strong><br>
                Our 24/7 operations dispatch team is ready to help at <a href="mailto:support@gatiman.in" style="color: %s; font-weight: 600;">support@gatiman.in</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td class="mobile-padding" style="padding: 28px 36px; text-align: center; background-color: #0F172A; color: #94A3B8; font-size: 12px; line-height: 1.7;">
          <div style="font-weight: 700; color: #FFFFFF; font-size: 14px; margin-bottom: 6px;">GATIMAN Delivery Network</div>
          <div style="color: #64748B; margin-bottom: 12px;">Delhi NCR Live Dispatch · Gurugram · Noida · Faridabad</div>
          <div style="border-top: 1px solid #1E293B; padding-top: 12px;">
            <a href="%s" style="color: #94A3B8; text-decoration: underline; margin: 0 8px;">Track Shipment</a> •
            <a href="%s" style="color: #94A3B8; text-decoration: underline; margin: 0 8px;">Customer Portal</a> •
            <a href="mailto:support@gatiman.in" style="color: #94A3B8; text-decoration: underline; margin: 0 8px;">Contact Support</a>
          </div>
          <div style="margin-top: 12px; color: #475569; font-size: 11px;">
            © 2026 GATIMAN Logistics Inc. All rights reserved.<br>
            This is an automated transactional notification sent for order #%s.
          </div>
        </td>
      </tr>

    </table>
  </center>
</body>
</html>
""".formatted(
                generateEmailSubject(eventType, order),
                BG_COLOR,
                TEXT_PRIMARY,
                BRAND_PRIMARY,
                BRAND_PRIMARY,
                BG_COLOR,
                BG_COLOR,
                CARD_BG,
                BORDER_COLOR,
                BRAND_PRIMARY,
                heroIcon,
                TEXT_PRIMARY,
                heroTitle,
                TEXT_SECONDARY,
                heroDescription,
                orderCardHtml,
                progressTimelineHtml,
                trackUrl,
                TEXT_SECONDARY,
                addressCardHtml,
                partnerCardHtml,
                BORDER_COLOR,
                BORDER_COLOR,
                TEXT_SECONDARY,
                TEXT_PRIMARY,
                BRAND_PRIMARY,
                trackUrl,
                baseUrl != null ? baseUrl : "http://localhost:5173",
                trackingNum
        );
    }

    private String getHeroIcon(EmailEventType eventType) {
        return switch (eventType) {
            case ORDER_CREATED, ORDER_CONFIRMED -> "✅";
            case AGENT_ASSIGNED -> "👤";
            case ORDER_PREPARING, ORDER_READY -> "📦";
            case PICKED_UP -> "📦";
            case ON_THE_WAY, OUT_FOR_DELIVERY -> "🚚";
            case NEAR_DESTINATION -> "📍";
            case DELIVERED -> "🎉";
            case DELIVERY_CANCELLED -> "❌";
            case DELIVERY_DELAYED -> "⏱️";
            case DELIVERY_FAILED -> "⚠️";
            case RESCHEDULE_APPROVED -> "📅";
            case RESCHEDULE_REJECTED -> "⚠️";
        };
    }

    private String getHeroTitle(EmailEventType eventType, String trackingNum) {
        return switch (eventType) {
            case ORDER_CREATED -> "Your Order Has Been Created";
            case ORDER_CONFIRMED -> "Your Order Has Been Confirmed!";
            case AGENT_ASSIGNED -> "Delivery Partner Assigned";
            case ORDER_PREPARING -> "Your Order is Being Prepared";
            case ORDER_READY -> "Package Ready for Pickup";
            case PICKED_UP -> "Your Package Has Been Picked Up";
            case ON_THE_WAY, OUT_FOR_DELIVERY -> "Your Order is On The Way! 🚚";
            case NEAR_DESTINATION -> "Your Delivery is Almost Here!";
            case DELIVERED -> "Your Package Has Been Delivered 🎉";
            case DELIVERY_CANCELLED -> "Order Cancellation Notice";
            case DELIVERY_DELAYED -> "Your Delivery is Taking a Little Longer";
            case DELIVERY_FAILED -> "Delivery Attempt Unsuccessful";
            case RESCHEDULE_APPROVED -> "Delivery Reschedule Approved";
            case RESCHEDULE_REJECTED -> "Reschedule Request Update";
        };
    }

    private String getHeroDescription(EmailEventType eventType, String customerName, String customMessage, Order order, Integer etaMinutes) {
        if (customMessage != null && !customMessage.isBlank()) {
            return "Hello " + customerName + ", " + customMessage;
        }

        return switch (eventType) {
            case ORDER_CREATED -> "Hello " + customerName + ", your shipment booking has been successfully registered with the GATIMAN network and is queued for verification.";
            case ORDER_CONFIRMED -> "Hello " + customerName + ", your order has been confirmed and verified. We are preparing your shipment for dispatch.";
            case AGENT_ASSIGNED -> "Hello " + customerName + ", a verified delivery partner has been assigned and is heading towards the pickup origin.";
            case ORDER_PREPARING -> "Hello " + customerName + ", your shipment is currently being packed and processed at the dispatch hub.";
            case ORDER_READY -> "Hello " + customerName + ", your parcel is ready and awaiting driver handover at origin.";
            case PICKED_UP -> "Hello " + customerName + ", our delivery partner has picked up your package and is proceeding with transit.";
            case ON_THE_WAY, OUT_FOR_DELIVERY -> "Hello " + customerName + ", your delivery partner is actively on the road heading to your delivery destination" + (etaMinutes != null ? " (Estimated Arrival: ~" + etaMinutes + " mins)." : ".");
            case NEAR_DESTINATION -> "Hello " + customerName + ", your delivery partner is within 500 meters of your destination! Please be ready for package handover.";
            case DELIVERED -> "Hello " + customerName + ", your package has been successfully delivered to the destination address. Thank you for choosing GATIMAN!";
            case DELIVERY_CANCELLED -> "Hello " + customerName + ", your delivery order has been cancelled. Any prepaid payments will be automatically refunded.";
            case DELIVERY_DELAYED -> "Hello " + customerName + ", we're sorry for the slight delay. Your driver is navigating high-density urban traffic and heading to your location as quickly as possible.";
            case DELIVERY_FAILED -> "Hello " + customerName + ", our driver partner was unable to complete the delivery handover. Please use the tracking link to reschedule your delivery slot.";
            case RESCHEDULE_APPROVED -> "Hello " + customerName + ", your requested reschedule delivery window has been approved and assigned for dispatch.";
            case RESCHEDULE_REJECTED -> "Hello " + customerName + ", your reschedule request could not be approved for the requested slot. Please check the tracking link for details.";
        };
    }

    private String getStatusBadgeText(EmailEventType eventType) {
        return switch (eventType) {
            case ORDER_CREATED -> "CREATED";
            case ORDER_CONFIRMED -> "CONFIRMED";
            case AGENT_ASSIGNED -> "DRIVER ASSIGNED";
            case ORDER_PREPARING -> "PREPARING";
            case ORDER_READY -> "READY FOR PICKUP";
            case PICKED_UP -> "PICKED UP";
            case ON_THE_WAY, OUT_FOR_DELIVERY -> "ON THE WAY";
            case NEAR_DESTINATION -> "NEAR DESTINATION";
            case DELIVERED -> "DELIVERED";
            case DELIVERY_CANCELLED -> "CANCELLED";
            case DELIVERY_DELAYED -> "DELAYED";
            case DELIVERY_FAILED -> "ATTEMPT FAILED";
            case RESCHEDULE_APPROVED -> "RESCHEDULED";
            case RESCHEDULE_REJECTED -> "REJECTED";
        };
    }

    private String getStatusBadgeColor(EmailEventType eventType) {
        return switch (eventType) {
            case DELIVERED, ORDER_CONFIRMED -> SUCCESS_COLOR;
            case ON_THE_WAY, OUT_FOR_DELIVERY, NEAR_DESTINATION -> BRAND_PRIMARY;
            case DELIVERY_DELAYED, AGENT_ASSIGNED, PICKED_UP, ORDER_PREPARING, ORDER_READY -> WARNING_COLOR;
            case DELIVERY_FAILED, DELIVERY_CANCELLED, RESCHEDULE_REJECTED -> DANGER_COLOR;
            default -> "#64748B";
        };
    }

    private String buildOrderCardHtml(Order order, String trackingNum, Integer etaMinutes, Double distanceRemaining, String statusText, String statusColor) {
        String totalAmount = order != null && order.getTotalCharge() != null ? "₹" + order.getTotalCharge().toPlainString() : "₹150.00";
        String etaText = etaMinutes != null && etaMinutes > 0 ? etaMinutes + " mins" : "Calculated Live";
        String distText = distanceRemaining != null && distanceRemaining > 0 ? String.format(Locale.US, "%.1f km", distanceRemaining) : "Calculated Live";
        String paymentType = order != null && order.getPaymentType() != null ? order.getPaymentType().name() : "PREPAID";

        return """
<table border="0" cellpadding="0" cellspacing="0" width="100%%" style="background-color: #F8FAFC; border: 1px solid %s; border-radius: 16px; overflow: hidden;">
  <tr>
    <td style="padding: 16px 20px; border-bottom: 1px solid %s; background-color: #F1F5F9;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%%">
        <tr>
          <td>
            <span style="font-size: 11px; font-weight: 700; color: %s; text-transform: uppercase; letter-spacing: 0.5px;">TRACKING ID</span>
            <div style="font-family: 'Courier New', monospace; font-size: 16px; font-weight: 800; color: %s; margin-top: 2px;">%s</div>
          </td>
          <td align="right">
            <span style="background-color: %s; color: #ffffff; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 20px; letter-spacing: 0.5px; display: inline-block;">
              %s
            </span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding: 16px 20px;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%%">
        <tr>
          <td width="33%%" style="padding-bottom: 8px;">
            <div style="font-size: 11px; color: %s; font-weight: 600; text-transform: uppercase;">Estimated ETA</div>
            <div style="font-size: 15px; font-weight: 800; color: %s; margin-top: 2px;">%s</div>
          </td>
          <td width="33%%" style="padding-bottom: 8px; text-align: center;">
            <div style="font-size: 11px; color: %s; font-weight: 600; text-transform: uppercase;">Distance</div>
            <div style="font-size: 15px; font-weight: 800; color: %s; margin-top: 2px;">%s</div>
          </td>
          <td width="33%%" style="padding-bottom: 8px; text-align: right;">
            <div style="font-size: 11px; color: %s; font-weight: 600; text-transform: uppercase;">Total (%s)</div>
            <div style="font-size: 15px; font-weight: 800; color: %s; margin-top: 2px;">%s</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
""".formatted(
                BORDER_COLOR,
                BORDER_COLOR,
                TEXT_SECONDARY,
                BRAND_PRIMARY,
                trackingNum,
                statusColor,
                statusText,
                TEXT_SECONDARY,
                TEXT_PRIMARY,
                etaText,
                TEXT_SECONDARY,
                TEXT_PRIMARY,
                distText,
                TEXT_SECONDARY,
                paymentType,
                BRAND_PRIMARY,
                totalAmount
        );
    }

    private String buildTimelineHtml(EmailEventType eventType) {
        int currentStep = switch (eventType) {
            case ORDER_CREATED, ORDER_CONFIRMED -> 1;
            case AGENT_ASSIGNED, ORDER_PREPARING, ORDER_READY -> 2;
            case PICKED_UP -> 3;
            case ON_THE_WAY, OUT_FOR_DELIVERY, DELIVERY_DELAYED -> 4;
            case NEAR_DESTINATION -> 5;
            case DELIVERED -> 6;
            default -> 1;
        };

        String[] stepLabels = {"Confirmed", "Prepared", "Picked Up", "On The Way", "Near You", "Delivered"};

        StringBuilder sb = new StringBuilder();
        sb.append("<div style=\"margin: 8px 0;\">");
        sb.append("<div style=\"font-size: 11px; font-weight: 700; color: ").append(TEXT_SECONDARY).append("; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;\">DELIVERY PROGRESS</div>");
        sb.append("<table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"text-align: center;\">");
        sb.append("<tr>");

        for (int i = 0; i < stepLabels.length; i++) {
            int stepNum = i + 1;
            boolean isCompleted = stepNum < currentStep;
            boolean isCurrent = stepNum == currentStep;

            String circleBg = isCompleted ? "#10B981" : (isCurrent ? BRAND_PRIMARY : "#E2E8F0");
            String circleColor = (isCompleted || isCurrent) ? "#FFFFFF" : "#94A3B8";
            String symbol = isCompleted ? "✓" : (isCurrent ? "●" : "○");
            String fontColor = (isCompleted || isCurrent) ? TEXT_PRIMARY : "#94A3B8";
            String fontWeight = isCurrent ? "700" : "500";

            sb.append("<td class=\"timeline-col\" style=\"vertical-align: top; padding: 0 2px;\">");
            sb.append("<div style=\"display: inline-block; width: 24px; height: 24px; line-height: 24px; border-radius: 50%; background-color: ").append(circleBg).append("; color: ").append(circleColor).append("; font-size: 12px; font-weight: bold;\">")
              .append(symbol).append("</div>");
            sb.append("<div style=\"font-size: 10px; color: ").append(fontColor).append("; font-weight: ").append(fontWeight).append("; margin-top: 4px; line-height: 1.2;\">")
              .append(stepLabels[i]).append("</div>");
            sb.append("</td>");
        }

        sb.append("</tr>");
        sb.append("</table>");
        sb.append("</div>");

        return sb.toString();
    }

    private String buildAddressCardHtml(Order order) {
        String pickupName = order != null && order.getPickupName() != null ? order.getPickupName() : "Hauz Khas Dispatch Origin";
        String pickupAddress = order != null && order.getPickupAddress() != null ? order.getPickupAddress() : "42, Hauz Khas Village, South Delhi, 110016";
        String dropName = order != null && order.getDropName() != null ? order.getDropName() : "Cyber City Drop Destination";
        String dropAddress = order != null && order.getDropAddress() != null ? order.getDropAddress() : "101, Cyber City, Phase 3, Gurugram, 122002";

        return """
<table border="0" cellpadding="0" cellspacing="0" width="100%%" style="border: 1px solid %s; border-radius: 16px; padding: 16px 20px; background-color: #ffffff;">
  <tr>
    <td style="padding-bottom: 12px;">
      <div style="font-size: 11px; font-weight: 700; color: %s; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px;">PICKUP ORIGIN</div>
      <div style="font-size: 13px; font-weight: 700; color: %s;">%s</div>
      <div style="font-size: 12px; color: %s; line-height: 1.4;">%s</div>
    </td>
  </tr>
  <tr>
    <td style="border-top: 1px dashed %s; padding-top: 12px;">
      <div style="font-size: 11px; font-weight: 700; color: %s; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px;">DELIVERY DESTINATION</div>
      <div style="font-size: 13px; font-weight: 700; color: %s;">%s</div>
      <div style="font-size: 12px; color: %s; line-height: 1.4;">%s</div>
    </td>
  </tr>
</table>
""".formatted(
                BORDER_COLOR,
                TEXT_SECONDARY,
                TEXT_PRIMARY,
                pickupName,
                TEXT_SECONDARY,
                pickupAddress,
                BORDER_COLOR,
                BRAND_PRIMARY,
                TEXT_PRIMARY,
                dropName,
                TEXT_SECONDARY,
                dropAddress
        );
    }

    private String buildDeliveryPartnerCardHtml(Order order) {
        if (order == null || order.getAssignedAgent() == null) {
            return "";
        }
        DeliveryAgent agent = order.getAssignedAgent();
        String partnerName = agent.getName() != null ? agent.getName() : "Verified Fleet Driver";
        String vehicleInfo = (agent.getVehicleType() != null ? agent.getVehicleType().name() : "EV SCOOTER") +
                (agent.getVehicleNumber() != null ? " · " + agent.getVehicleNumber() : "");

        return """
<tr>
  <td class="mobile-padding" style="padding: 0 36px 24px 36px;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%%" style="border: 1px solid #C7D2FE; border-radius: 16px; padding: 14px 20px; background-color: #EEF2FF;">
      <tr>
        <td width="40" style="vertical-align: middle;">
          <div style="width: 36px; height: 36px; line-height: 36px; border-radius: 50%%; background-color: #4F46E5; color: #ffffff; text-align: center; font-weight: 800; font-size: 14px;">
            %s
          </div>
        </td>
        <td style="padding-left: 12px; vertical-align: middle;">
          <div style="font-size: 11px; font-weight: 700; color: #4338CA; text-transform: uppercase;">YOUR DELIVERY PARTNER</div>
          <div style="font-size: 14px; font-weight: 800; color: #1E1B4B; margin-top: 1px;">%s</div>
          <div style="font-size: 11px; color: #6366F1; font-weight: 600; font-family: monospace;">%s</div>
        </td>
      </tr>
    </table>
  </td>
</tr>
""".formatted(
                partnerName.length() >= 2 ? partnerName.substring(0, 2).toUpperCase() : "DP",
                partnerName,
                vehicleInfo
        );
    }
}
