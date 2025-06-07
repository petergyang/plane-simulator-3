export class AudioManager {
    constructor() {
        this.backgroundMusic = null;
        this.musicVolume = 0.3; // 30% volume
        this.isMusicEnabled = true;
        this.isInitialized = false;
        this.hasUserInteracted = false;
    }

    async initialize() {
        if (this.isInitialized) return;
        
        try {
            // Load background music
            await this.loadBackgroundMusic();
            
            this.isInitialized = true;
            console.log('Audio system initialized successfully');
        } catch (error) {
            console.error('Failed to initialize audio system:', error);
        }
    }

    async loadBackgroundMusic() {
        return new Promise((resolve, reject) => {
            this.backgroundMusic = new Audio('/assets/music.mp3');
            this.backgroundMusic.loop = true;
            this.backgroundMusic.volume = this.musicVolume;
            this.backgroundMusic.preload = 'auto';
            
            this.backgroundMusic.addEventListener('canplaythrough', () => {
                console.log('Background music loaded successfully');
                resolve();
            });
            
            this.backgroundMusic.addEventListener('error', (error) => {
                console.error('Failed to load background music:', error);
                // Don't reject - game should work without music
                resolve();
            });
            
            // Timeout fallback
            setTimeout(() => {
                console.warn('Background music loading timeout');
                resolve();
            }, 5000);
        });
    }



    playBackgroundMusic() {
        if (this.backgroundMusic && this.isMusicEnabled) {
            this.backgroundMusic.play().catch(error => {
                console.warn('Could not play background music:', error);
            });
        }
    }

    pauseBackgroundMusic() {
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
        }
    }

    playSound(soundName) {
        if (this.soundEffects[soundName]) {
            this.soundEffects[soundName]();
        }
    }

    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.backgroundMusic) {
            this.backgroundMusic.volume = this.musicVolume;
        }
    }

    setSfxVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
    }

    toggleMusic() {
        this.isMusicEnabled = !this.isMusicEnabled;
        if (this.isMusicEnabled) {
            this.playBackgroundMusic();
        } else {
            this.pauseBackgroundMusic();
        }
    }

    toggleSfx() {
        this.isSfxEnabled = !this.isSfxEnabled;
    }

    // Call this on first user interaction to handle autoplay policies
    async resumeAudioContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    }
} 