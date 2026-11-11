import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { AttendanceWebSocketMessage, UnknownCardResponse } from '../../../types/dashboard';

interface WsCallbacks {
    onAttendance: (msg: AttendanceWebSocketMessage) => void;
    onUnknownCard?: (card: UnknownCardResponse) => void;
}

export const useAttendanceWs = ({ onAttendance, onUnknownCard }: WsCallbacks) => {
    const [isConnected, setIsConnected] = useState(false);
    const stompClientRef = useRef<Client | null>(null);

    useEffect(() => {
        const rawToken = localStorage.getItem('token');
        if (!rawToken) return;

        const authHeaderValue = rawToken.startsWith('Bearer ') ? rawToken : `Bearer ${rawToken}`;
        const authHeaders = { Authorization: authHeaderValue };

        const client = new Client({
            webSocketFactory: () => new SockJS('/ws'),
            connectHeaders: authHeaders,
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: () => {
                setIsConnected(true);

                // 1. Lắng nghe điểm danh hợp lệ
                client.subscribe(
                    '/topic/attendance',
                    (message) => {
                        if (message.body) {
                            try {
                                onAttendance(JSON.parse(message.body));
                            } catch (err) {
                                console.error('Lỗi parse bản tin Attendance:', err);
                            }
                        }
                    },
                    authHeaders
                );

                // 2. Lắng nghe thẻ lạ (nếu backend phát)
                if (onUnknownCard) {
                    client.subscribe(
                        '/topic/attendance/unknown',
                        (message) => {
                            if (message.body) {
                                try {
                                    onUnknownCard(JSON.parse(message.body));
                                } catch (err) {
                                    console.error('Lỗi parse bản tin Unknown Card:', err);
                                }
                            }
                        },
                        authHeaders
                    );
                }
            },
            onDisconnect: () => setIsConnected(false),
            onStompError: () => setIsConnected(false),
        });

        client.activate();
        stompClientRef.current = client;

        return () => {
            stompClientRef.current?.deactivate();
        };
    }, [onAttendance, onUnknownCard]);

    return { isConnected };
};