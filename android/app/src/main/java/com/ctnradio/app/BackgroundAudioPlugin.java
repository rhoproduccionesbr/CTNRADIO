package com.ctnradio.app;

import android.content.Intent;
import android.os.Build;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "BackgroundAudio")
public class BackgroundAudioPlugin extends Plugin {

    @PluginMethod
    public void start(PluginCall call) {
        String title = call.getString("title", "CTN Radio en Vivo");
        String artist = call.getString("artist", "De Guarambaré al Mundo");
        boolean isPlaying = Boolean.TRUE.equals(call.getBoolean("isPlaying", true));

        Intent intent = new Intent(getContext(), BackgroundAudioService.class);
        intent.setAction(BackgroundAudioService.ACTION_START);
        intent.putExtra(BackgroundAudioService.EXTRA_TITLE, title);
        intent.putExtra(BackgroundAudioService.EXTRA_ARTIST, artist);
        intent.putExtra(BackgroundAudioService.EXTRA_IS_PLAYING, isPlaying);

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                getContext().startForegroundService(intent);
            } else {
                getContext().startService(intent);
            }
            call.resolve();
        } catch (Exception e) {
            call.reject("Error starting BackgroundAudioService: " + e.getMessage(), e);
        }
    }

    @PluginMethod
    public void stop(PluginCall call) {
        try {
            Intent intent = new Intent(getContext(), BackgroundAudioService.class);
            intent.setAction(BackgroundAudioService.ACTION_STOP);
            getContext().startService(intent);
            call.resolve();
        } catch (Exception e) {
            call.reject("Error stopping BackgroundAudioService: " + e.getMessage(), e);
        }
    }

    @PluginMethod
    public void updateMetadata(PluginCall call) {
        String title = call.getString("title", "CTN Radio en Vivo");
        String artist = call.getString("artist", "De Guarambaré al Mundo");
        boolean isPlaying = Boolean.TRUE.equals(call.getBoolean("isPlaying", true));

        try {
            Intent intent = new Intent(getContext(), BackgroundAudioService.class);
            intent.setAction(BackgroundAudioService.ACTION_UPDATE_META);
            intent.putExtra(BackgroundAudioService.EXTRA_TITLE, title);
            intent.putExtra(BackgroundAudioService.EXTRA_ARTIST, artist);
            intent.putExtra(BackgroundAudioService.EXTRA_IS_PLAYING, isPlaying);
            getContext().startService(intent);
            call.resolve();
        } catch (Exception e) {
            call.reject("Error updating metadata: " + e.getMessage(), e);
        }
    }
}
