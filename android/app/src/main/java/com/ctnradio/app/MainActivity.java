package com.ctnradio.app;

import android.content.Intent;
import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.webkit.WebSettings;
import android.webkit.WebView;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    public static MainActivity instance;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(BackgroundAudioPlugin.class);
        super.onCreate(savedInstanceState);
        instance = this;

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (checkSelfPermission(android.Manifest.permission.POST_NOTIFICATIONS) != android.content.pm.PackageManager.PERMISSION_GRANTED) {
                requestPermissions(new String[]{android.Manifest.permission.POST_NOTIFICATIONS}, 101);
            }
        }

        int appColor = Color.parseColor("#09090B");
        Window window = getWindow();
        if (window != null) {
            window.setStatusBarColor(appColor);
            window.setNavigationBarColor(appColor);
            window.setBackgroundDrawable(new ColorDrawable(appColor));

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                window.setNavigationBarContrastEnforced(false);
            }

            WindowInsetsControllerCompat controller =
                WindowCompat.getInsetsController(window, window.getDecorView());
            if (controller != null) {
                controller.setAppearanceLightStatusBars(false); // Iconos claros para barra de estado
                controller.setAppearanceLightNavigationBars(false); // Botones claros para barra de navegación
            }
        }

        View contentView = findViewById(android.R.id.content);
        if (contentView != null) {
            contentView.setBackgroundColor(appColor);
            ViewCompat.setOnApplyWindowInsetsListener(contentView, (v, insets) -> {
                androidx.core.graphics.Insets bars = insets.getInsets(
                    WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout()
                );
                v.setPadding(bars.left, bars.top, bars.right, bars.bottom);
                return WindowInsetsCompat.CONSUMED;
            });
        }
    }

    @Override
    public void onStart() {
        super.onStart();
        try {
            WebView webView = this.getBridge().getWebView();
            if (webView != null) {
                webView.setBackgroundColor(Color.parseColor("#09090B"));
                WebSettings settings = webView.getSettings();
                settings.setMediaPlaybackRequiresUserGesture(false);
                settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
                settings.setDomStorageEnabled(true);
                settings.setDatabaseEnabled(true);
                webView.addJavascriptInterface(new AndroidBridge(), "AndroidBridge");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public class AndroidBridge {
        @android.webkit.JavascriptInterface
        public void startAudio(String title, String artist, boolean isPlaying) {
            Intent intent = new Intent(MainActivity.this, BackgroundAudioService.class);
            intent.setAction(BackgroundAudioService.ACTION_START);
            intent.putExtra(BackgroundAudioService.EXTRA_TITLE, title);
            intent.putExtra(BackgroundAudioService.EXTRA_ARTIST, artist);
            intent.putExtra(BackgroundAudioService.EXTRA_IS_PLAYING, isPlaying);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                startForegroundService(intent);
            } else {
                startService(intent);
            }
        }

        @android.webkit.JavascriptInterface
        public void stopAudio() {
            Intent intent = new Intent(MainActivity.this, BackgroundAudioService.class);
            intent.setAction(BackgroundAudioService.ACTION_STOP);
            startService(intent);
        }

        @android.webkit.JavascriptInterface
        public void updateMeta(String title, String artist, boolean isPlaying) {
            Intent intent = new Intent(MainActivity.this, BackgroundAudioService.class);
            intent.setAction(BackgroundAudioService.ACTION_UPDATE_META);
            intent.putExtra(BackgroundAudioService.EXTRA_TITLE, title);
            intent.putExtra(BackgroundAudioService.EXTRA_ARTIST, artist);
            intent.putExtra(BackgroundAudioService.EXTRA_IS_PLAYING, isPlaying);
            startService(intent);
        }

        @android.webkit.JavascriptInterface
        public boolean isNative() {
            return true;
        }
    }

    public void sendPlayPauseToWebView(boolean isPlaying) {
        runOnUiThread(() -> {
            try {
                if (getBridge() != null && getBridge().getWebView() != null) {
                    String js = "window.dispatchEvent(new CustomEvent('nativeAudioToggle', { detail: { isPlaying: " + isPlaying + " } }));";
                    getBridge().getWebView().evaluateJavascript(js, null);
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        });
    }

    public void sendMuteToWebView(boolean isMuted) {
        runOnUiThread(() -> {
            try {
                if (getBridge() != null && getBridge().getWebView() != null) {
                    String js = "window.dispatchEvent(new CustomEvent('nativeAudioMute', { detail: { isMuted: " + isMuted + " } }));";
                    getBridge().getWebView().evaluateJavascript(js, null);
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        });
    }

    @Override
    public void onDestroy() {
        if (instance == this) {
            instance = null;
        }
        super.onDestroy();
    }
}
