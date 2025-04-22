function calculateOtherGroupAttributes(group) {

let ATTRIBUTES = {
    mobility: 0,
    willpower: 0,
    stealth: 0,
    perception: 0,
    tradition: 0,
    influence: 0,
    cohesion: 0,
    harmony: 0,
    culturalVariance: 0,
    partySlots : 0,
    primaryAttributes: {
        strength: 0,
        cunning: 0,
        artisanship: 0,
        education: 0,
        dexterity: 0
    },
    cultureKnowledge: {
      Latin: 0,
      Western: 0,
      Eastern: 0,
      Muslim: 0,
      Tribal: 0,
      Asian: 0
    },
    cultureKnowledgeAverage: 0,
    fame: 0,
    lore: 0,
    entropy: 0,
    speed: 0,
    size: 0

};

    updateOtherGroupAttributes(group, ATTRIBUTES);


    return ATTRIBUTES;
}





function updateOtherGroupAttributes(group, ATTRIBUTES) {


    
    // PRIMARY ATTRIBUTES //
      for (const adventurer of group.values()) {
        ATTRIBUTES.primaryAttributes.strength += adventurer.Attributes.Strength;
        ATTRIBUTES.primaryAttributes.cunning += adventurer.Attributes.Cunning;
        ATTRIBUTES.primaryAttributes.artisanship += adventurer.Attributes.Artisanship;
        ATTRIBUTES.primaryAttributes.education += adventurer.Attributes.Education;
        ATTRIBUTES.primaryAttributes.dexterity += adventurer.Attributes.Dexterity;
        ATTRIBUTES.size++;
      }
    
    
    


    


      const thisGroup1 = Array.from(group.keys().next().value);


    
    
    
      // COHESION //
      let thisGroup = Array.from(group.values());

      ATTRIBUTES.speed = calculateGroupSpeed();

      // GROUP_ATTRIBUTES.lore = calculateGroupLore();
      // GROUP_ATTRIBUTES.tradition = Math.round(GROUP_ATTRIBUTES.primaryAttributes.artisanship / 10);
    
    
      // COHESION //
      ATTRIBUTES.quality = calculateGroupQuality(thisGroup);
      ATTRIBUTES.culturalVariance = calculateCulturalVariance(thisGroup);
      ATTRIBUTES.harmony = calculateTypeHarmony(thisGroup);
    
     
      ATTRIBUTES.willpower = calculateWillpower(ATTRIBUTES);
      ATTRIBUTES.cohesion = calculateCohesion(ATTRIBUTES.culturalVariance, ATTRIBUTES.harmony, ATTRIBUTES.primaryAttributes.education, thisGroup.length);
      ATTRIBUTES.influence = calculateInfluence(ATTRIBUTES);
      ATTRIBUTES.tradition = calculateTradition(ATTRIBUTES);
      ATTRIBUTES.stealth = calculateStealth(ATTRIBUTES);
      ATTRIBUTES.perception = calculatePerception(ATTRIBUTES);
      ATTRIBUTES.mobility = calculateMobility(ATTRIBUTES);
    
      ATTRIBUTES.cultureKnowledge = calculateCategorySum();
      calculateCulturePercentages();

}


