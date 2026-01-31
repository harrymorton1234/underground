/**
 * Enemy entity for battle
 */
class Enemy {
    constructor(data) {
        // Copy base data
        this.id = data.id;
        this.name = data.name;
        this.hp = data.hp;
        this.maxHp = data.maxHp;
        this.attack = data.attack;
        this.defense = data.defense;
        this.exp = data.exp;
        this.gold = data.gold;

        // Flags
        this.isBoss = data.isBoss || false;
        this.isFinalBoss = data.isFinalBoss || false;
        this.isMegaBoss = data.isMegaBoss || false;

        // Text
        this.flavorText = data.flavorText;
        this.checkText = data.checkText;
        this.encounterText = data.encounterText;
        this.spareText = data.spareText;
        this.deathText = data.deathText;

        // Spare conditions
        this.canSpare = data.canSpare || false;
        this.spareCondition = data.spareCondition;

        // ACT options
        this.actOptions = data.actOptions || ['Check'];
        this.actResponses = data.actResponses || {};

        // Battle state
        this.talkCount = data.talkCount || 0;
        this.admireCount = data.admireCount || 0;
        this.mercyCount = data.mercyCount || 0;
        this.complimented = data.complimented || false;
        this.danced = data.danced || false;
        this.remembered = data.remembered || false;
        this.enraged = data.enraged || false;

        // Patterns
        this.patterns = data.patterns || [];
        this.phases = data.phases || null;
        this.currentPhase = 0;

        // Visual
        this.x = 160;
        this.y = 45;
        this.sprite = data.sprite || 'enemy';
        this.width = data.width || 32;
        this.height = data.height || 32;

        // Animation
        this.shakeTimer = 0;
        this.flashTimer = 0;
        this.hurtTimer = 0;
        this.visible = true;

        // State
        this.defeated = false;
        this.spared = false;
    }

    /**
     * Update enemy
     */
    update(dt) {
        // Update shake effect
        if (this.shakeTimer > 0) {
            this.shakeTimer -= dt;
        }

        // Update flash effect
        if (this.flashTimer > 0) {
            this.flashTimer -= dt;
        }

        // Update hurt effect
        if (this.hurtTimer > 0) {
            this.hurtTimer -= dt;
            // Flicker visibility during hurt
            this.visible = Math.floor(this.hurtTimer * 20) % 2 === 0;
        } else {
            this.visible = true;
        }

        // Check phase transitions for bosses
        if (this.phases) {
            this.checkPhaseTransition();
        }
    }

    /**
     * Render enemy
     */
    render() {
        if (!this.visible) return;

        let x = this.x;
        let y = this.y;

        // Apply shake offset
        if (this.shakeTimer > 0) {
            x += (Math.random() - 0.5) * 4;
            y += (Math.random() - 0.5) * 4;
        }

        // Get sprite name based on enemy ID
        const spriteName = 'enemy_' + this.id;
        const sprite = Renderer.sprites[spriteName];

        if (sprite) {
            // Draw the sprite
            const drawX = x - sprite.width / 2;
            const drawY = y - sprite.height / 2;

            // Flash white overlay when hit
            if (this.flashTimer > 0) {
                Renderer.ctx.globalAlpha = 0.5;
            }

            Renderer.ctx.drawImage(sprite, Math.floor(drawX), Math.floor(drawY));
            Renderer.ctx.globalAlpha = 1;

            // Update dimensions based on sprite
            this.width = sprite.width;
            this.height = sprite.height;
        } else {
            // Fallback to colored rectangle
            let color = '#fff';
            if (this.isBoss) color = '#f0f';
            if (this.enraged) color = '#f00';
            if (this.flashTimer > 0) color = '#fff';

            Renderer.drawRect(
                x - this.width / 2,
                y - this.height / 2,
                this.width,
                this.height,
                color
            );
        }

        // Draw name above
        Renderer.drawText(
            this.name,
            x,
            y - this.height / 2 - 14,
            this.canSpareNow() ? '#ff0' : '#fff',
            'center'
        );

        // Draw HP bar for bosses
        if (this.isBoss) {
            const barWidth = 60;
            const barHeight = 6;
            const barX = x - barWidth / 2;
            const barY = y + this.height / 2 + 5;

            Renderer.drawRect(barX, barY, barWidth, barHeight, '#333');
            Renderer.drawRect(barX, barY, barWidth * (this.hp / this.maxHp), barHeight, '#0f0');
        }
    }

    /**
     * Take damage
     */
    takeDamage(amount) {
        // Apply defense
        const actualDamage = Math.max(1, amount - this.defense);
        this.hp = Math.max(0, this.hp - actualDamage);

        // Visual feedback
        this.hurtTimer = 0.5;
        this.flashTimer = 0.1;
        this.shakeTimer = 0.2;

        // Check for defeat
        if (this.hp <= 0) {
            this.defeated = true;
        }

        return actualDamage;
    }

    /**
     * Check if can be spared now
     */
    canSpareNow() {
        return this.canSpare || Enemies.checkSpareCondition(this);
    }

    /**
     * Perform ACT
     */
    performAct(action) {
        // Check action is the standard Check
        if (action === 'Check') {
            return {
                text: this.checkText,
                spareable: false
            };
        }

        // Get action response
        const response = this.actResponses[action];
        if (!response) {
            return {
                text: `* You tried ${action}.\n* Nothing happened.`,
                spareable: false
            };
        }

        // Apply effect
        if (response.effect) {
            Enemies.applyActEffect(this, response.effect);
        }

        // Check if this makes enemy spareable
        let spareable = false;
        if (response.spareable === true) {
            spareable = true;
            this.canSpare = true;
        } else if (response.spareable === 'checkTalkCount') {
            spareable = this.talkCount >= (this.spareTalkThreshold || 2);
            if (spareable) this.canSpare = true;
        } else if (response.spareable === 'checkAdmireCount') {
            spareable = this.admireCount >= (this.spareTalkThreshold || 2);
            if (spareable) this.canSpare = true;
        } else if (response.spareable === 'checkMercyCount') {
            spareable = this.mercyCount >= (this.spareTalkThreshold || 5);
            if (spareable) this.canSpare = true;
        }

        return {
            text: response.text,
            spareable,
            damage: response.damage || 0
        };
    }

    /**
     * Get current attack patterns
     */
    getPatterns() {
        if (this.phases && this.phases[this.currentPhase]) {
            return this.phases[this.currentPhase].patterns;
        }
        return this.patterns;
    }

    /**
     * Check for phase transition
     */
    checkPhaseTransition() {
        if (!this.phases) return null;

        for (let i = this.phases.length - 1; i > this.currentPhase; i--) {
            if (this.hp <= this.phases[i].hpThreshold) {
                this.currentPhase = i;

                // Return dialogue if phase has one
                if (this.phases[i].dialogue) {
                    return this.phases[i].dialogue;
                }
                break;
            }
        }

        return null;
    }

    /**
     * Spare the enemy
     */
    spare() {
        this.spared = true;
    }

    /**
     * Get random flavor text
     */
    getFlavorText() {
        if (Array.isArray(this.flavorText)) {
            return Utils.randomChoice(this.flavorText);
        }
        return this.flavorText;
    }

    /**
     * Calculate damage to player
     */
    calculateDamage(playerDefense) {
        let damage = this.attack - playerDefense;
        if (this.enraged) {
            damage = Math.floor(damage * 1.5);
        }
        return Math.max(1, damage);
    }
}

// Make globally available
window.Enemy = Enemy;
