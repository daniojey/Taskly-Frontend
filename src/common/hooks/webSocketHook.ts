import { useState, useCallback, useRef, useEffect } from "react";

interface useWebSocketOptions {
    url: string;
    enabled: boolean;
    onMessage?: (event: MessageEvent) => void;
    onOpen?: () => void;
    onError?: (error: Event) => void;
    onClose?: () => void;
    reconnectInterval?: number;
    maxReconnectAttempt?: number;
}

export const useWebSocket = ({
    url,
    onMessage,
    onOpen,
    onError,
    onClose,
    enabled = true,
    reconnectInterval = 3000,
    maxReconnectAttempt = 10
}: useWebSocketOptions) => {
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<number>(0);
    const reconnectAttemptsRef = useRef(0);
    const [isConnected, setIsConnected] = useState(false);
    const shouldConnectRef = useRef(enabled);

    const onMessageRef = useRef(onMessage);
    const onOpenRef = useRef(onOpen);
    const onErrorRef = useRef(onError);
    const onCloseRef = useRef(onClose);

    useEffect(() => {
        onMessageRef.current = onMessage;
        onOpenRef.current = onOpen;
        onErrorRef.current = onError;
        onCloseRef.current = onClose;
    }, [onMessage, onOpen, onError, onClose]);

    const connect = useCallback(() => {

        if (!shouldConnectRef.current || !enabled) return;

        // if (wsRef.current) {
        //     wsRef.current.close();
        // }

        try {
            console.log('Подключаемся к WebSocket...');
            const ws = new WebSocket(url);
            wsRef.current = ws;

            ws.onopen = () => {
                console.log('WebSocket подключен!');
                setIsConnected(true);
                reconnectAttemptsRef.current = 0;
                onOpenRef.current?.();
            };

            ws.onmessage = (event) => {
                onMessageRef.current?.(event);
            };

            ws.onerror = (error) => {
                console.error('WebSocket ошибка:', error);
                onErrorRef.current?.(error);
            };

            ws.onclose = () => {
                console.log('WebSocket закрыт');
                setIsConnected(false);
                onCloseRef.current?.();

                if (
                    shouldConnectRef.current &&
                    reconnectAttemptsRef.current < maxReconnectAttempt
                ) {
                    reconnectAttemptsRef.current++;
                    console.log(
                        `Переподключение... Попытка ${reconnectAttemptsRef.current}/${maxReconnectAttempt}`
                    );

                    reconnectTimeoutRef.current = window.setTimeout(() => {
                        connect();
                    }, reconnectInterval);
                } else if (reconnectAttemptsRef.current >= maxReconnectAttempt) {
                    console.error('Достигнут лимит попыток переподключения');
                }
            };
            
        } catch (error) {
            console.error('Не удалось создать WebSocket:', error);
        }
    }, [url, enabled, reconnectInterval, maxReconnectAttempt]);

    const disconnect = useCallback(() => {
        shouldConnectRef.current = false;
        
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }
        
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
        
        setIsConnected(false);
    }, []);

    const send = useCallback((data: string | ArrayBufferLike | Blob | ArrayBufferView) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(data);
        } else {
            console.warn('WebSocket не подключен');
        }
    }, []);

    useEffect(() => {
        shouldConnectRef.current = enabled;

        if (enabled) {
            connect();
        } else {
            disconnect()
        }

        return () => {
            shouldConnectRef.current = false;
            
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
        };
    }, [url, enabled]);

    return {
        isConnected,
        send,
        disconnect,
        reconnect: connect
    };
};