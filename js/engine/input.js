/**
 * Input handling system
 * Supports keyboard and gamepad
 */
const Input = {
    // Key states
    keys: {},
    keysJustPressed: {},
    keysJustReleased: {},

    // Gamepad state
    gamepad: null,
    gamepadButtons: {},
    gamepadButtonsJustPressed: {},

    // Key mappings
    keyMappings: {
        confirm: ['z', 'Z', 'Enter'],
        cancel: ['x', 'X', 'Shift', 'Escape'],
        menu: ['c', 'C'],
        up: ['ArrowUp', 'w', 'W'],
        down: ['ArrowDown', 's', 'S'],
        left: ['ArrowLeft', 'a', 'A'],
        right: ['ArrowRight', 'd', 'D']
    },

    // Gamepad button mappings (standard layout)
    gamepadMappings: {
        confirm: 0,      // A button
        cancel: 1,       // B button
        menu: 2,         // X button
        up: 12,          // D-pad up
        down: 13,        // D-pad down
        left: 14,        // D-pad left
        right: 15        // D-pad right
    },

    // Input buffering
    inputBuffer: [],
    bufferDuration: 100, // ms

    /**
     * Initialize input system
     */
    init() {
        // Keyboard events
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));

        // Gamepad events
        window.addEventListener('gamepadconnected', (e) => this.onGamepadConnected(e));
        window.addEventListener('gamepaddisconnected', (e) => this.onGamepadDisconnected(e));

        // Prevent default for game keys
        window.addEventListener('keydown', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Enter'].includes(e.key)) {
                e.preventDefault();
            }
        });
    },

    /**
     * Handle key down
     */
    onKeyDown(e) {
        if (!this.keys[e.key]) {
            this.keysJustPressed[e.key] = true;
            this.addToBuffer(e.key);
        }
        this.keys[e.key] = true;
    },

    /**
     * Handle key up
     */
    onKeyUp(e) {
        this.keys[e.key] = false;
        this.keysJustReleased[e.key] = true;
    },

    /**
     * Handle gamepad connected
     */
    onGamepadConnected(e) {
        console.log('Gamepad connected:', e.gamepad.id);
        this.gamepad = e.gamepad;
    },

    /**
     * Handle gamepad disconnected
     */
    onGamepadDisconnected(e) {
        console.log('Gamepad disconnected');
        this.gamepad = null;
        this.gamepadButtons = {};
    },

    /**
     * Add input to buffer
     */
    addToBuffer(key) {
        this.inputBuffer.push({
            key,
            time: performance.now()
        });

        // Clean old inputs
        const now = performance.now();
        this.inputBuffer = this.inputBuffer.filter(input =>
            now - input.time < this.bufferDuration
        );
    },

    /**
     * Check if action is in buffer
     */
    checkBuffer(action) {
        const keys = this.keyMappings[action] || [];
        const now = performance.now();

        for (const input of this.inputBuffer) {
            if (now - input.time < this.bufferDuration && keys.includes(input.key)) {
                // Remove from buffer once consumed
                this.inputBuffer = this.inputBuffer.filter(i => i !== input);
                return true;
            }
        }
        return false;
    },

    /**
     * Update gamepad state
     */
    updateGamepad() {
        if (!this.gamepad) {
            // Try to find a connected gamepad
            const gamepads = navigator.getGamepads();
            for (const gp of gamepads) {
                if (gp) {
                    this.gamepad = gp;
                    break;
                }
            }
        }

        if (this.gamepad) {
            // Refresh gamepad state
            const gamepads = navigator.getGamepads();
            this.gamepad = gamepads[this.gamepad.index];

            if (this.gamepad) {
                // Check each mapped button
                for (const [action, buttonIndex] of Object.entries(this.gamepadMappings)) {
                    const pressed = this.gamepad.buttons[buttonIndex]?.pressed || false;

                    if (pressed && !this.gamepadButtons[buttonIndex]) {
                        this.gamepadButtonsJustPressed[buttonIndex] = true;
                    }

                    this.gamepadButtons[buttonIndex] = pressed;
                }

                // Also check analog stick for directions
                const deadzone = 0.5;
                const axes = this.gamepad.axes;

                if (axes[0] < -deadzone) this.keys['GamepadLeft'] = true;
                else if (axes[0] > deadzone) this.keys['GamepadRight'] = true;
                else {
                    this.keys['GamepadLeft'] = false;
                    this.keys['GamepadRight'] = false;
                }

                if (axes[1] < -deadzone) this.keys['GamepadUp'] = true;
                else if (axes[1] > deadzone) this.keys['GamepadDown'] = true;
                else {
                    this.keys['GamepadUp'] = false;
                    this.keys['GamepadDown'] = false;
                }
            }
        }
    },

    /**
     * Check if action is held down
     */
    isDown(action) {
        const keys = this.keyMappings[action] || [];

        // Check keyboard
        for (const key of keys) {
            if (this.keys[key]) return true;
        }

        // Check gamepad button
        const buttonIndex = this.gamepadMappings[action];
        if (buttonIndex !== undefined && this.gamepadButtons[buttonIndex]) {
            return true;
        }

        // Check gamepad analog for directions
        if (action === 'left' && this.keys['GamepadLeft']) return true;
        if (action === 'right' && this.keys['GamepadRight']) return true;
        if (action === 'up' && this.keys['GamepadUp']) return true;
        if (action === 'down' && this.keys['GamepadDown']) return true;

        return false;
    },

    /**
     * Check if action was just pressed this frame
     */
    isPressed(action) {
        const keys = this.keyMappings[action] || [];

        // Check keyboard
        for (const key of keys) {
            if (this.keysJustPressed[key]) return true;
        }

        // Check gamepad
        const buttonIndex = this.gamepadMappings[action];
        if (buttonIndex !== undefined && this.gamepadButtonsJustPressed[buttonIndex]) {
            return true;
        }

        return false;
    },

    /**
     * Check if action was just released this frame
     */
    isReleased(action) {
        const keys = this.keyMappings[action] || [];

        for (const key of keys) {
            if (this.keysJustReleased[key]) return true;
        }

        return false;
    },

    /**
     * Get directional input as vector
     */
    getDirection() {
        let x = 0;
        let y = 0;

        if (this.isDown('left')) x -= 1;
        if (this.isDown('right')) x += 1;
        if (this.isDown('up')) y -= 1;
        if (this.isDown('down')) y += 1;

        // Normalize diagonal movement
        if (x !== 0 && y !== 0) {
            const len = Math.sqrt(x * x + y * y);
            x /= len;
            y /= len;
        }

        return { x, y };
    },

    /**
     * Clear just pressed/released states (call at end of frame)
     */
    update() {
        this.updateGamepad();
    },

    /**
     * Clear transient states (call at end of frame)
     */
    endFrame() {
        this.keysJustPressed = {};
        this.keysJustReleased = {};
        this.gamepadButtonsJustPressed = {};
    },

    /**
     * Check if any key is pressed
     */
    anyKeyPressed() {
        return Object.keys(this.keysJustPressed).length > 0 ||
               Object.keys(this.gamepadButtonsJustPressed).length > 0;
    }
};

// Make it globally available
window.Input = Input;
