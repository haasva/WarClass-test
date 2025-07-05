class Adventurer {
  constructor(name, baseStats) {
    this.name = name;
    this._baseStats = {...baseStats};
    this._activeModifiers = {};
    this.currentStats = {...baseStats};
    this.passiveSkills = [];
  }

  addModifier(sourceId, stat, value, isMultiplicative = false) {
    if (!this._activeModifiers[sourceId]) {
      this._activeModifiers[sourceId] = [];
    }
    
    this._activeModifiers[sourceId].push({ stat, value, isMultiplicative });
    this._recalculateStats();
  }

  removeModifiers(sourceId) {
    if (this._activeModifiers[sourceId]) {
      delete this._activeModifiers[sourceId];
      this._recalculateStats();
    }
  }

  _recalculateStats() {
    // Reset to base stats
    this.currentStats = {...this._baseStats};
    
    // Apply additive modifiers first
    Object.values(this._activeModifiers).flat().forEach(mod => {
      if (!mod.isMultiplicative) {
        this.currentStats[mod.stat] += mod.value;
      }
    });
    
    // Then apply multiplicative modifiers
    Object.values(this._activeModifiers).flat().forEach(mod => {
      if (mod.isMultiplicative) {
        this.currentStats[mod.stat] *= (1 + mod.value); // Using 1+value for percentage increases
      }
    });
  }

  addPassiveSkill(skill) {
    this.passiveSkills.push(skill);
  }

  updateSkills(gameState) {
    this.passiveSkills.forEach(skill => {
      if (skill.checkConditions(gameState, this)) {
        skill.applyEffects(this);
      } else {
        skill.removeEffects(this);
      }
    });
  }
}



class PassiveSkill {
  constructor(id, conditions, effects) {
    this.id = id;
    this.conditions = conditions;
    this.effects = effects;
    this.isActive = false;
  }

  checkConditions(gameState, adventurer) {
    return this.conditions.every(cond => cond(gameState, adventurer));
  }

  applyEffects(adventurer) {
    if (!this.isActive) {
      this.effects.forEach(effect => effect(adventurer, this.id));
      this.isActive = true;
    }
  }

  removeEffects(adventurer) {
    if (this.isActive) {
      adventurer.removeModifiers(this.id);
      this.isActive = false;
    }
  }
}

// Create a condition that's always true (for always-active passives)
const alwaysActive = () => true;

// Create the gold find passive skill (10% bonus)
const goldFinder = new PassiveSkill(
  'gold_finder',
  [alwaysActive], // Condition - always active
  [
    (adventurer, sourceId) => adventurer.addModifier(sourceId, 'goldFind', 0.10, true)
  ]
);