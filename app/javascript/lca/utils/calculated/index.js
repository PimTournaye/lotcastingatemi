export * from './_charms.js'
export * from './_battlegroups.js'
export * from './_pools.js'
export * from './_weapons.js'

import { capitalize, includes } from 'lodash'
import { ATTACK_ABILITIES, ABILITIES_ALL } from '../constants.js'

/* Defense values (Parry is per-weapon) */
export function evasionRaw(character) {
  // TODO specialties
  // TODO penalties
  return Math.ceil((character.attr_dexterity + character.abil_dodge) / 2)
}

export function guileRaw(character) {
  // TODO specialties
  // TODO penalties
  return Math.ceil((character.attr_manipulation + character.abil_socialize) / 2)
}

export function resolveRaw(character) {
  // TODO specialties
  // TODO penalties
  return Math.ceil((character.attr_wits + character.abil_integrity) / 2)
}

/* Health */
export function totalHealthLevels(character) {
  return character.health_level_0s + character.health_level_1s +
    character.health_level_2s + character.health_level_4s +
    character.health_level_incap
}

export function woundPenalty(character) {
  // TODO merits that have an effect on wound penalties
  const totalDmg = character.damage_bashing + character.damage_lethal + character.damage_aggravated
  const lvl0 = character.health_level_0s
  const lvl1 = character.health_level_1s
  const lvl2 = character.health_level_2s
  const lvl4 = character.health_level_4s

  if (totalDmg <= lvl0) {
    return 0
  } else if (totalDmg <= (lvl0 + lvl1)) {
    return 1
  } else if (totalDmg <= (lvl0 + lvl1 + lvl2)) {
    return 2
  } else if (totalDmg <= (lvl0 + lvl1 + lvl2 + lvl4)) {
    return 4
  } else {
    return -1
  }
}

export function attackAbilities(character) {
  let abils = ATTACK_ABILITIES.filter((abil) => character[abil] > 0).map(function(abil) {
    let name = abil.substring(5)
    return {
      abil: name,
      rating: character[abil],
      specialties: character.specialties.filter((spec) => spec.ability == name),
    }
  })

  let mas = character.abil_martial_arts.map((abil)=> {
    let name = abil.style
    return {
      abil: name,
      rating: abil.rating,
      specialties: character.specialties.filter((spec) => spec.ability == 'martial arts'),
    }
  })

  return abils.concat(mas)
}

export function abilitiesWithRatings(character) {
  const abils = ABILITIES_ALL.filter((a) => {
    if (a.abil == 'abil_craft' || a.abil == 'abil_martial_arts')
      return character[a.abil].length > 0
    else
      return character[a.abil] > 0
  })

  return abils
}

export function mobilityPenalty(character) {
  switch(character.armor_weight) {
  case 'heavy':
    return 2
  case 'medium':
    return 1
  case 'light':
  case 'unarmored':
  default:
    return 0
  }
}

export function armorSoak(character) {
  switch(character.armor_weight) {
  case 'light':
    return character.armor_is_artifact ? 5 : 3
  case 'medium':
    return character.armor_is_artifact ? 8 : 5
  case 'heavy':
    return character.armor_is_artifact ? 11 : 7
  case 'unarmored':
  default:
    return 0
  }
}

export function naturalSoak(character) {
  // TODO handle merits and other effects that modify natural soak
  return character.attr_stamina
}

export function hardness(character) {
  if (! character.armor_is_artifact)
    return 0
  switch(character.armor_weight) {
  case 'light':
    return 4
  case 'medium':
    return 7
  case 'heavy':
    return 10
  }
}

export function prettyExaltType(character) {
  switch (character.type) {
  case 'Character':
    return 'Mortal'
  case 'SolarCharacter':
    return 'Solar'
  default:
    return 'Exalt'
  }
}

export function prettyFullExaltType(character) {
  let type = prettyExaltType(character)

  switch (character.type) {
  case 'SolarCharacter':
    type = `${capitalize(character.caste || '_____')} Caste ${type}`
  }

  return type
}

export function prettyIntimacyRating(rating) {
  switch(rating) {
  case 3:
    return 'Defining'
  case 2:
    return 'Major'
  case 1:
    return 'Minor'
  default:
    return 'N/A'
  }
}

export function prettyAnimaLevel(rating) {
  switch(rating) {
  case 3:
    return 'Bonfire'
  case 2:
    return 'Burning'
  case 1:
    return 'Glowing'
  case 0:
  default:
    return 'Dim'
  }
}

export function isCasteAbility(character, ability) {
  return character.caste_abilities && includes(character.caste_abilities, ability)
}

export function isSupernalAbility(character, ability) {
  return character.supernal_ability === ability
}

export function isFavoredAbility(character, ability) {
  return character.favored_abilities && includes(character.favored_abilities, ability)
}
