/**
 * Utility functions and helpers
 */
const Utils = {
    /**
     * Clamp a value between min and max
     */
    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    },

    /**
     * Linear interpolation
     */
    lerp(start, end, t) {
        return start + (end - start) * t;
    },

    /**
     * Random integer between min and max (inclusive)
     */
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    /**
     * Random float between min and max
     */
    randomFloat(min, max) {
        return Math.random() * (max - min) + min;
    },

    /**
     * Pick random element from array
     */
    randomChoice(array) {
        return array[Math.floor(Math.random() * array.length)];
    },

    /**
     * Shuffle array in place
     */
    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    },

    /**
     * Distance between two points
     */
    distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    },

    /**
     * Angle between two points (in radians)
     */
    angle(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    },

    /**
     * Check AABB collision between two rectangles
     */
    rectCollision(a, b) {
        return a.x < b.x + b.width &&
               a.x + a.width > b.x &&
               a.y < b.y + b.height &&
               a.y + a.height > b.y;
    },

    /**
     * Check circle collision
     */
    circleCollision(x1, y1, r1, x2, y2, r2) {
        const dist = this.distance(x1, y1, x2, y2);
        return dist < r1 + r2;
    },

    /**
     * Check point inside rectangle
     */
    pointInRect(px, py, rect) {
        return px >= rect.x && px < rect.x + rect.width &&
               py >= rect.y && py < rect.y + rect.height;
    },

    /**
     * Check point inside circle
     */
    pointInCircle(px, py, cx, cy, radius) {
        return this.distance(px, py, cx, cy) < radius;
    },

    /**
     * Deep clone an object
     */
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    /**
     * Ease in out quad
     */
    easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    },

    /**
     * Ease out quad
     */
    easeOutQuad(t) {
        return 1 - (1 - t) * (1 - t);
    },

    /**
     * Ease in quad
     */
    easeInQuad(t) {
        return t * t;
    },

    /**
     * Convert degrees to radians
     */
    degToRad(degrees) {
        return degrees * Math.PI / 180;
    },

    /**
     * Convert radians to degrees
     */
    radToDeg(radians) {
        return radians * 180 / Math.PI;
    },

    /**
     * Format time as MM:SS
     */
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },

    /**
     * Simple hash function for strings
     */
    hash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash;
    },

    /**
     * Wait for a number of milliseconds (use with async/await)
     */
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    /**
     * Create a simple timer object
     */
    createTimer(duration, callback, loop = false) {
        return {
            duration,
            elapsed: 0,
            callback,
            loop,
            active: true,
            update(dt) {
                if (!this.active) return;
                this.elapsed += dt;
                if (this.elapsed >= this.duration) {
                    this.callback();
                    if (this.loop) {
                        this.elapsed = 0;
                    } else {
                        this.active = false;
                    }
                }
            },
            reset() {
                this.elapsed = 0;
                this.active = true;
            }
        };
    }
};

// Make it globally available
window.Utils = Utils;
