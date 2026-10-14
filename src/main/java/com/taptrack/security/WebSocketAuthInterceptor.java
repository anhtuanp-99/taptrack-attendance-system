package com.taptrack.security;

import com.taptrack.enums.Role;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private static final String TOPIC_ATTENDANCE = "/topic/attendance";

    private final JwtTokenProvider jwt;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor acc = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (acc == null) return message;

        if (StompCommand.CONNECT.equals(acc.getCommand())
                || StompCommand.SUBSCRIBE.equals(acc.getCommand())) {

            // Chỉ cho SUBSCRIBE vào /topic/attendance
            if (StompCommand.SUBSCRIBE.equals(acc.getCommand())) {
                String dest = acc.getDestination();
                if (dest == null || !dest.startsWith(TOPIC_ATTENDANCE)) {
                    throw new IllegalArgumentException("Chỉ được subscribe " + TOPIC_ATTENDANCE);
                }
            }

            String header = acc.getFirstNativeHeader("Authorization");
            if (header == null || !header.startsWith("Bearer ")) {
                throw new IllegalArgumentException("Thiếu Authorization header");
            }
            try {
                Claims c = jwt.parse(header.substring(7)).getPayload();
                Role role = Role.valueOf(c.get("role", String.class));
                if (role != Role.ADMIN) {
                    throw new IllegalArgumentException("Chỉ ADMIN được subscribe");
                }
                var principal = new UserPrincipal(
                        Long.valueOf(c.getSubject()),
                        c.get("email", String.class),
                        role);
                acc.setUser(new UsernamePasswordAuthenticationToken(
                        principal, null, principal.getAuthorities()));
            } catch (IllegalArgumentException ex) {
                throw ex;
            } catch (Exception ex) {
                throw new IllegalArgumentException("Token không hợp lệ: " + ex.getMessage());
            }
        }
        return message;
    }
}