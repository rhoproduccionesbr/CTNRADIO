package com.ctnradio.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.content.res.Configuration;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.PorterDuff;
import android.graphics.PorterDuffColorFilter;
import android.graphics.RectF;
import android.graphics.drawable.Drawable;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;
import android.support.v4.media.MediaMetadataCompat;
import android.support.v4.media.session.MediaSessionCompat;
import android.support.v4.media.session.PlaybackStateCompat;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;
import androidx.core.content.ContextCompat;
import androidx.media.app.NotificationCompat.MediaStyle;

public class BackgroundAudioService extends Service {

    private static final String CHANNEL_ID = "ctn_radio_playback";
    private static final int NOTIFICATION_ID = 1;

    public static final String ACTION_START = "com.ctnradio.app.ACTION_START";
    public static final String ACTION_STOP = "com.ctnradio.app.ACTION_STOP";
    public static final String ACTION_UPDATE_META = "com.ctnradio.app.ACTION_UPDATE_META";
    public static final String ACTION_PLAY_PAUSE = "com.ctnradio.app.ACTION_PLAY_PAUSE";
    public static final String ACTION_SHARE = "com.ctnradio.app.ACTION_SHARE";
    public static final String ACTION_MUTE = "com.ctnradio.app.ACTION_MUTE";

    public static final String EXTRA_TITLE = "title";
    public static final String EXTRA_ARTIST = "artist";
    public static final String EXTRA_IS_PLAYING = "is_playing";

    private MediaSessionCompat mediaSession;
    private PowerManager.WakeLock wakeLock;

    private String currentTitle = "CTN Radio en Vivo";
    private String currentArtist = "De Guarambaré al Mundo";
    private boolean isPlaying = true;
    private boolean isMuted = false;

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();
        setupMediaSession();

        // Acquire a partial wake lock to keep CPU active for audio streaming
        PowerManager pm = (PowerManager) getSystemService(POWER_SERVICE);
        if (pm != null) {
            wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "CTNRadio::AudioWakeLock");
            wakeLock.setReferenceCounted(false);
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent == null)
            return START_STICKY;

        String action = intent.getAction();
        if (action == null)
            action = ACTION_START;

        switch (action) {
            case ACTION_START:
                currentTitle = intent.getStringExtra(EXTRA_TITLE);
                if (currentTitle == null || currentTitle.isEmpty())
                    currentTitle = "CTN Radio en Vivo";
                currentArtist = intent.getStringExtra(EXTRA_ARTIST);
                if (currentArtist == null || currentArtist.isEmpty())
                    currentArtist = "De Guarambaré al Mundo";
                isPlaying = intent.getBooleanExtra(EXTRA_IS_PLAYING, true);

                if (wakeLock != null && !wakeLock.isHeld()) {
                    wakeLock.acquire(12 * 60 * 60 * 1000L); // 12 hours max
                }

                startForeground(NOTIFICATION_ID, buildNotification());
                updateMediaSessionState();
                break;

            case ACTION_UPDATE_META:
                String title = intent.getStringExtra(EXTRA_TITLE);
                String artist = intent.getStringExtra(EXTRA_ARTIST);
                if (title != null && !title.isEmpty())
                    currentTitle = title;
                if (artist != null && !artist.isEmpty())
                    currentArtist = artist;
                isPlaying = intent.getBooleanExtra(EXTRA_IS_PLAYING, isPlaying);

                updateNotification();
                updateMediaSessionState();
                break;

            case ACTION_PLAY_PAUSE:
                isPlaying = !isPlaying;
                updateNotification();
                updateMediaSessionState();
                // Send the toggle back to the WebView via the activity
                if (MainActivity.instance != null) {
                    MainActivity.instance.sendPlayPauseToWebView(isPlaying);
                }
                break;

            case ACTION_MUTE:
                isMuted = !isMuted;
                updateNotification();
                if (MainActivity.instance != null) {
                    MainActivity.instance.sendMuteToWebView(isMuted);
                }
                break;

            case ACTION_SHARE:
                try {
                    Intent shareIntent = new Intent(Intent.ACTION_SEND);
                    shareIntent.setType("text/plain");
                    shareIntent.putExtra(Intent.EXTRA_TEXT,
                            "Escucha CTN Radio en vivo desde Guarambaré al mundo:\nhttps://ctnradio.vercel.app");
                    Intent chooser = Intent.createChooser(shareIntent, "Compartir CTN Radio");
                    chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    startActivity(chooser);
                } catch (Exception e) {
                    e.printStackTrace();
                }
                break;

            case ACTION_STOP:
                isPlaying = false;
                if (wakeLock != null && wakeLock.isHeld()) {
                    wakeLock.release();
                }
                stopForeground(true);
                stopSelf();
                break;
        }

        return START_STICKY;
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "CTN Radio Reproducción",
                    NotificationManager.IMPORTANCE_LOW);
            channel.setDescription("Controles de reproducción de CTN Radio");
            channel.setShowBadge(false);
            channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);

            NotificationManager nm = getSystemService(NotificationManager.class);
            if (nm != null)
                nm.createNotificationChannel(channel);
        }
    }

    private void setupMediaSession() {
        mediaSession = new MediaSessionCompat(this, "CTNRadioSession");

        mediaSession.setFlags(
                MediaSessionCompat.FLAG_HANDLES_MEDIA_BUTTONS |
                        MediaSessionCompat.FLAG_HANDLES_TRANSPORT_CONTROLS);

        mediaSession.setCallback(new MediaSessionCompat.Callback() {
            @Override
            public void onPlay() {
                if (!isPlaying) {
                    isPlaying = true;
                    updateNotification();
                    updateMediaSessionState();
                    if (MainActivity.instance != null) {
                        MainActivity.instance.sendPlayPauseToWebView(true);
                    }
                }
            }

            @Override
            public void onPause() {
                if (isPlaying) {
                    isPlaying = false;
                    updateNotification();
                    updateMediaSessionState();
                    if (MainActivity.instance != null) {
                        MainActivity.instance.sendPlayPauseToWebView(false);
                    }
                }
            }

            @Override
            public void onStop() {
                isPlaying = false;
                updateNotification();
                updateMediaSessionState();
                if (MainActivity.instance != null) {
                    MainActivity.instance.sendPlayPauseToWebView(false);
                }
                stopForeground(true);
                stopSelf();
            }
        });

        mediaSession.setActive(true);
    }

    private void updateMediaSessionState() {
        if (mediaSession == null)
            return;

        // Quitar barra de progreso: solo controles play/pause/stop sin SEEK_TO,
        // posición desconocida
        PlaybackStateCompat.Builder stateBuilder = new PlaybackStateCompat.Builder()
                .setActions(
                        PlaybackStateCompat.ACTION_PLAY |
                                PlaybackStateCompat.ACTION_PAUSE |
                                PlaybackStateCompat.ACTION_PLAY_PAUSE |
                                PlaybackStateCompat.ACTION_STOP)
                .setState(
                        isPlaying ? PlaybackStateCompat.STATE_PLAYING : PlaybackStateCompat.STATE_PAUSED,
                        PlaybackStateCompat.PLAYBACK_POSITION_UNKNOWN,
                        isPlaying ? 1.0f : 0f);

        mediaSession.setPlaybackState(stateBuilder.build());

        Bitmap logoArt = getLogoBitmap();

        MediaMetadataCompat.Builder metaBuilder = new MediaMetadataCompat.Builder()
                .putString(MediaMetadataCompat.METADATA_KEY_TITLE, currentTitle)
                .putString(MediaMetadataCompat.METADATA_KEY_ARTIST, currentArtist)
                .putString(MediaMetadataCompat.METADATA_KEY_ALBUM, "CTN Radio 24/7")
                .putLong(MediaMetadataCompat.METADATA_KEY_DURATION, -1L) // -1 indica transmisión en vivo sin barra de
                                                                         // duración
                .putBitmap(MediaMetadataCompat.METADATA_KEY_ALBUM_ART, logoArt);

        mediaSession.setMetadata(metaBuilder.build());
    }

    private Bitmap getLogoBitmap() {
        int nightModeFlags = getResources().getConfiguration().uiMode & Configuration.UI_MODE_NIGHT_MASK;
        boolean isNight = (nightModeFlags == Configuration.UI_MODE_NIGHT_YES);

        int size = 256;
        Bitmap bitmap = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888);
        Canvas canvas = new Canvas(bitmap);

        // Sin fondo artificial: 100% transparente para tomar el color nativo de la
        // tarjeta del sistema
        Drawable drawable = ContextCompat.getDrawable(this, R.drawable.ic_notification);
        if (drawable != null) {
            Drawable mutate = drawable.mutate();
            // Modo oscuro: logo blanco. Modo claro: logo azul marino (#1E3A8A)
            int logoColor = isNight ? Color.WHITE : Color.parseColor("#1E3A8A");
            mutate.setColorFilter(new PorterDuffColorFilter(logoColor, PorterDuff.Mode.SRC_IN));

            int padding = 16;
            mutate.setBounds(padding, padding, size - padding, size - padding);
            mutate.draw(canvas);
        }
        return bitmap;
    }

    private Notification buildNotification() {
        // Intent to open the app when tapping the notification
        Intent openIntent = new Intent(this, MainActivity.class);
        openIntent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent openPendingIntent = PendingIntent.getActivity(
                this, 0, openIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        // 1. Play/Pause action
        Intent playPauseIntent = new Intent(this, BackgroundAudioService.class);
        playPauseIntent.setAction(ACTION_PLAY_PAUSE);
        PendingIntent playPausePending = PendingIntent.getService(
                this, 1, playPauseIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        // 2. Mute action
        Intent muteIntent = new Intent(this, BackgroundAudioService.class);
        muteIntent.setAction(ACTION_MUTE);
        PendingIntent mutePending = PendingIntent.getService(
                this, 2, muteIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        // 3. Share action
        Intent shareIntent = new Intent(this, BackgroundAudioService.class);
        shareIntent.setAction(ACTION_SHARE);
        PendingIntent sharePending = PendingIntent.getService(
                this, 3, shareIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        // 4. Stop action
        Intent stopIntent = new Intent(this, BackgroundAudioService.class);
        stopIntent.setAction(ACTION_STOP);
        PendingIntent stopPending = PendingIntent.getService(
                this, 4, stopIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        Bitmap largeIcon = getLogoBitmap();

        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_notification)
                .setLargeIcon(largeIcon)
                .setContentTitle(currentTitle)
                .setContentText(currentArtist)
                .setSubText("CTN Radio")
                .setContentIntent(openPendingIntent)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setOngoing(isPlaying)
                .setShowWhen(false)
                .setColor(Color.parseColor("#1E3A8A")) // Acento azul marino oscuro
                .setColorized(true)
                .setPriority(NotificationCompat.PRIORITY_LOW)
                .setStyle(new MediaStyle()
                        .setMediaSession(mediaSession.getSessionToken())
                        .setShowActionsInCompactView(0, 1, 2) // Play/Pause, Mute y Compartir en vista compacta/pantalla
                                                              // de bloqueo
                )
                .addAction(
                        isPlaying ? R.drawable.ic_pause : R.drawable.ic_play,
                        isPlaying ? "Pausar" : "Reproducir",
                        playPausePending)
                .addAction(
                        isMuted ? R.drawable.ic_volume_off : R.drawable.ic_volume_up,
                        isMuted ? "Desmutear" : "Silenciar",
                        mutePending)
                .addAction(
                        R.drawable.ic_share,
                        "Compartir",
                        sharePending)
                .addAction(
                        R.drawable.ic_stop,
                        "Detener",
                        stopPending);

        return builder.build();
    }

    private void updateNotification() {
        NotificationManager nm = getSystemService(NotificationManager.class);
        if (nm != null) {
            nm.notify(NOTIFICATION_ID, buildNotification());
        }
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onDestroy() {
        if (mediaSession != null) {
            mediaSession.setActive(false);
            mediaSession.release();
        }
        if (wakeLock != null && wakeLock.isHeld()) {
            wakeLock.release();
        }
        super.onDestroy();
    }
}
