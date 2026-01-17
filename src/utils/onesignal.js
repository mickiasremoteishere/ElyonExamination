export const initializeOneSignal = () => {
  if (typeof window !== 'undefined') {
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    OneSignalDeferred.push(function(OneSignal) {
      OneSignal.init({
        appId: import.meta.env.VITE_ONESIGNAL_APP_ID,
        safari_web_id: import.meta.env.VITE_ONESIGNAL_SAFARI_WEB_ID,
        notifyButton: {
          enable: true,
        },
        allowLocalhostAsSecureOrigin: true,
      });
    });

    window.OneSignalDeferred.push(function(OneSignal) {
      OneSignal.showSlidedownPrompt();
    });
  }
};

export const sendNotification = async (message, url = null) => {
  if (typeof window !== 'undefined' && window.OneSignal) {
    const notification = {
      contents: { en: message },
      included_segments: ["Subscribed Users"],
    };

    if (url) {
      notification.url = url;
    }

    try {
      const response = await fetch('https://onesignal.com/api/v1/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Authorization': `Basic ${import.meta.env.VITE_ONESIGNAL_REST_API_KEY}`
        },
        body: JSON.stringify(notification)
      });
      return await response.json();
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }
};