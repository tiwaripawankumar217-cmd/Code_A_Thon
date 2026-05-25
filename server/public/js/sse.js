// Connect Server-Sent Events (SSE) listener for real-time fraud alerts
if (typeof EventSource !== "undefined") {
    const eventSource = new EventSource("/stream");
    eventSource.onmessage = function(event) {
        try {
            const data = JSON.parse(event.data);
            if (data.type === 'fraud_alert') {
                if (typeof showFraudToast === 'function') {
                    showFraudToast(data);
                } else {
                    console.warn("Fraud Alert received, but showFraudToast is not defined:", data);
                }
            }
        } catch (err) {
            console.error("Error parsing SSE data:", err);
        }
    };
}
